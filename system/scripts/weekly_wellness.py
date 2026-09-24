#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
weekly_wellness.py — 养生周报生成器

按周推送「下周 7 天」的建议（比每天推送更实用：一次采购、一次备膳）。

核心设计：
  1. 安全筛只做一次（候选池 × 匿名成员），结果缓存 → 成本从 7×160 降到 ~170 次
  2. 每天从「安全池」里选主力/对症/惊喜 → 7×2 次
  3. 汇总 7 天食材 → 一份采购清单
  4. 全流程走匿名 ID，本地还原

用法：
  python weekly_wellness.py                 # 下周（从明天算起 7 天）
  python weekly_wellness.py --start 2026-09-22
  python weekly_wellness.py --json          # 输出 JSON
"""
import os, sys, json, argparse, datetime, collections

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import wellness_jev as w
from weather_fetch import fetch_weather   # 天气已整合进周任务（不再单独跑天气 cron）

# 节气起始日期（2026 年，公历近似，可微调）
TERM_DATES_2026 = [
    ("小寒","2026-01-05"),("大寒","2026-01-20"),("立春","2026-02-04"),("雨水","2026-02-18"),
    ("惊蛰","2026-03-05"),("春分","2026-03-20"),("清明","2026-04-04"),("谷雨","2026-04-20"),
    ("立夏","2026-05-05"),("小满","2026-05-21"),("芒种","2026-06-05"),("夏至","2026-06-21"),
    ("小暑","2026-07-07"),("大暑","2026-07-22"),("立秋","2026-08-07"),("处暑","2026-08-23"),
    ("白露","2026-09-07"),("秋分","2026-09-23"),("寒露","2026-10-08"),("霜降","2026-10-23"),
    ("立冬","2026-11-07"),("小雪","2026-11-22"),("大雪","2026-12-07"),("冬至","2026-12-21"),
]
WEEKDAY = ["周一","周二","周三","周四","周五","周六","周日"]

# 每人 1 个对症方向（症状 → 诉求）
MEMBER_FOCUS = {
    "M1": "祛湿 + 控尿酸（痰湿质、尿酸偏高）",
    "M2": "安神助眠 + 滋阴（睡眠浅）",
    "M3": "护血脂（服他汀）+ 温和易消化",
    "M4": "祛寒湿、暖关节（风湿、晨起喷嚏）",
    "M5": "助眠 + 生长发育（14岁，睡眠差）",
    "M6": "幼儿辅食安全（3岁，忌窒息/氰苷）",
}


def term_of(date):
    """返回该日期所属节气 + 候"""
    ds = [(n, datetime.date.fromisoformat(d)) for n, d in TERM_DATES_2026]
    cur = ds[0][0]
    for name, d in ds:
        if date >= d:
            cur = name
        else:
            break
    # 候：节气内每 5 天
    start = dict(ds)[cur]
    day_idx = (date - start).days
    hou = "初候" if day_idx < 5 else ("二候" if day_idx < 10 else "三候")
    return cur, hou


def build(start=None, days=7, weather=None):
    start = start or (datetime.date.today() + datetime.timedelta(days=1))
    weather = weather if weather is not None else fetch_weather()
    # 天气 → 环境描述：让 JEV 把「此刻高湿/高温」纳入判断，而不只看节气
    wtxt = ""
    if str(weather.get('temp_C')) not in ('?', 'None', '', 'None'):
        wtxt = f"；实时天气：{weather['temp_C']}°C 湿度{weather['humidity']}% {weather.get('desc', '')}"
        for tr in weather.get('triggers', []):
            wtxt += f"；⚠️{tr['mode']}"
            if tr.get('note'):
                wtxt += f"（{tr['note']}）"
    plan = []
    all_foods = collections.Counter()
    notes = set()

    # ── 分节气聚合（同一节气只做一次安全筛，省钱）
    by_term = {}
    for i in range(days):
        d = start + datetime.timedelta(days=i)
        t, hou = term_of(d)
        by_term.setdefault(t, []).append((d, hou))

    safe_pools = {}
    for t in by_term:
        si = w.season_info(t, None)
        cand = si["foods"]
        passed, rule_blocked = w.rule_gate(cand)
        safe, banned = [], list(rule_blocked)
        for f in passed:
            bad = False
            for mid in w.PROFILES_ANON:
                r = w.jev_safety(f, mid)
                if str(r.get("value") or "").lower() == "forbidden" and float(r.get("confidence") or 0) >= 0.5:
                    banned.append({"food": f, "member": mid, "conf": r.get("confidence"), "src": "JEV"})
                    bad = True
                    break
            if not bad:
                safe.append(f)
        safe_pools[t] = (safe, banned)

    # ── 逐日生成（⚠️ 关键：把「本周已推荐」写进 state，否则 JEV 确定性会导致天天同一答案）
    used = set()
    per_used = collections.defaultdict(set)      # ⚠️ 必须在循环外：跨天累积才叫去重
    for i in range(days):
        d = start + datetime.timedelta(days=i)
        t, hou = term_of(d)
        safe, banned = safe_pools[t]
        si = w.season_info(t, hou)
        for b in banned:
            if b.get("level"):
                notes.add(f"🚫 {b['food']}：{b.get('why','')[:34]}（{b.get('src')}）")
            elif b.get("member"):
                notes.add(f"🚫 {b['food']} × {w.restore(b['member'])}：有明确禁忌（{b.get('src')}）")

        avoid = "、".join(sorted(used)) or "无"
        env = (f"节气：{t}「{hou}」；气候：{si['climate']}；饮食原则：{si['principle']}；忌：{si['avoid']}"
               f"{wtxt}"
               f"\n⚠️本周已推荐过、本次必须避开（求变化）：{avoid}")
        pool = [f for f in safe if f not in used] or safe      # 优先未用过的
        opts = {f"f{j}": f for j, f in enumerate(pool[:40])}

        main = w.jev_choice("今日最适合【全家共同食用】的主力食材选哪个？", opts, env, note=f"{d}main")
        mname = opts.get(str(main.get("value") or ""), "")
        if mname: used.add(mname)

        opts2 = {k: v for k, v in opts.items() if v not in used and v != mname} or opts
        sur = w.jev_choice("今日作为【惊喜尝鲜】的食材选哪个（求新意但须合乎时令）？", opts2, env, note=f"{d}surprise")
        sname = opts2.get(str(sur.get("value") or ""), "")
        if sname: used.add(sname)

        # 每人对症：各自独立去重（⚠️ 不进全局 used —— 否则 7 天会把候选池耗干，
        # 导致后期全家人收敛到同一个食材）
        per = {}
        for mid, focus in MEMBER_FOCUS.items():
            ex = "、".join(sorted(per_used[mid])) or "无"
            o3 = {k: v for k, v in opts.items() if v not in per_used[mid]} or opts
            r = w.jev_choice(
                f"结合今日节气与诉求「{focus}」，该成员最适合的食材选哪个？"
                f"（本人本周已用过、须避开：{ex}）", o3, env, note=f"{d}{mid}")
            k = str(r.get("value") or "")
            pick = o3.get(k, k or "—")
            per[w.restore(mid)] = pick
            if pick and pick != "—":
                per_used[mid].add(pick)          # 只记在本人名下

        for x in [mname, sname] + list(per.values()):
            if x and x != "—": all_foods[x] += 1

        plan.append({
            "date": str(d), "weekday": WEEKDAY[d.weekday()],
            "term": t, "pentad": hou,
            "main": mname, "main_conf": main.get("confidence"),
            "surprise": sname, "surprise_conf": sur.get("confidence"),
            "per_member": per,
            "principle": si["principle"],
        })

    return {"start": str(start), "days": days, "plan": plan,
            "shopping": all_foods.most_common(), "alerts": sorted(notes),
            "weather": weather}


def render(r):
    L = []
    L.append(f"🌿 养生周报 · {r['start']} 起 {r['days']} 天")
    L.append("")
    for p in r["plan"]:
        L.append(f"**{p['weekday']} {p['date'][5:]}** · {p['term']}「{p['pentad']}」")
        L.append(f"  🏠 全家：**{p['main']}**")
        L.append(f"  ✨ 尝鲜：{p['surprise']}")
        bits = [f"{k}:{v}" for k, v in p["per_member"].items() if v and v != "—"]
        L.append(f"  👤 " + " | ".join(bits))
        L.append("")
    wt = r.get("weather") or {}
    if str(wt.get("temp_C")) not in ("?", "None", "", "None"):
        L.append("——— 🌡 天气 ———")
        L.append(f"  当前：{wt.get('temp_C')}°C 湿度{wt.get('humidity')}% {wt.get('desc', '')}")
        for tr in wt.get("triggers", []):
            L.append(f"  ⚡ {tr['mode']}" + (f"：{tr['note']}" if tr.get("note") else ""))
        for f_ in wt.get("forecast", []):
            L.append(f"  📅 {str(f_['date'])[5:]}  {f_['tmin']}~{f_['tmax']}°C  湿度{f_['humidity']}%  {f_['desc']}")
        L.append("")
    L.append("——— 🛒 采购清单（按出现次数）———")
    L.append("  " + "、".join(f"{f}×{n}" for f, n in r["shopping"]))
    L.append("")
    if r["alerts"]:
        L.append("——— ⚠️ 安全提醒 ———")
        for a in r["alerts"]:
            L.append("  " + a)
    return "\n".join(L)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--start")
    ap.add_argument("--days", type=int, default=7)
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()
    st = datetime.date.fromisoformat(a.start) if a.start else None
    res = build(st, a.days)
    out = json.dumps(res, ensure_ascii=False, indent=1) if a.json else render(res)
    print(out)
    fp = os.path.expanduser("~/.hermes/cache/scratch/weekly_plan.json")
    json.dump(res, open(fp, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f"\n[已存 {fp}]", file=sys.stderr)
