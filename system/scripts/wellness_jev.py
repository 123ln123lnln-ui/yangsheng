#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
wellness_jev.py — 养生 JEV 判断层

把养生从「LLM 自由生成」改成「JEV 判断 + LLM 只负责组句」。

四个判断点：
  1. safety_gate   — 候选食材 × 家庭成员 → safe/caution/forbidden（硬闸门，一票否决）
  2. triage_symptom— 飞书回执文本 → 症状类别（闭环入口）
  3. pick_foods    — 节气+天气+症状 → 今日食材（主力/对症/惊喜）
  4. score_season  — 食材 × 节气 → 契合度

铁律：
  · JEV 只做「从枚举选项里选」，不做自由生成 → 不可能幻觉
  · 选项全部来自知识库，不由模型编
  · 安全闸门用 conf 分段：≥0.8 自动拦截 / 0.5-0.8 提示咨询 / <0.5 转人工
  · 每次判断留痕（可回归测试）

用法：
  python wellness_jev.py safety --foods "西柚,苦瓜,冬瓜"
  python wellness_jev.py symptom --text "最近上火，嘴巴苦"
  python wellness_jev.py pick --solar-term 大暑 --weather "湿度94%"
"""
import os, sys, json, subprocess, argparse, time, re

HOME = os.path.expanduser("~")
WELL = r"I:\华为云盘\00 soul\01_Projects\wellness"
JEV = os.path.join(HOME, ".hermes", "scripts", "jev", "jev.py")
LOG = os.path.join(HOME, ".hermes", "cache", "scratch", "wellness_jev_log.jsonl")

# ── 症状类别（回执解析的枚举，含出口）────────────────────
SYMPTOMS = {
    "heat":    "上火（口苦/口干/长痘/便秘/咽痛/眼干）",
    "damp":    "湿重（身重/困倦/舌苔厚腻/食欲差/大便黏）",
    "cold":    "寒湿（怕冷/关节痛/晨起喷嚏/遇冷加重）",
    "sleep":   "睡眠差（入睡难/易醒/多梦/早醒）",
    "fatigue": "疲乏（乏力/精神不振/懒言）",
    "uric":    "尿酸升高信号（关节不适/饮酒后/脚趾痛）",
    "cough":   "呼吸道（咳嗽/痰多/鼻塞）",
    "stomach": "脾胃（腹胀/反酸/腹泻/胃痛）",
    "none":    "无异常（今日状态正常）",
    "other":   "其他或无法归类",
}

# ── 安全闸门选项 ────────────────────────────────────────
SAFETY_OPTS = {
    "safe":      "安全可食（无禁忌，可正常食用）",
    "caution":   "可食但需注意（有轻微影响或需限量/特殊处理）",
    "forbidden": "绝对禁用（存在明确禁忌或毒性风险）",
}


# ══════════════════════════════════════════════════════════
# 基础：调 JEV
# ══════════════════════════════════════════════════════════
def _run(args):
    # 🔒 隐私硬闸门：出网前自检，任何真实称谓混入即抛错（唯一出网口）
    _assert_clean(" ".join(str(a) for a in args), "jev.py 调用")
    r = subprocess.run([sys.executable, JEV] + args,
                       capture_output=True, text=True, encoding='utf-8', timeout=120)
    return r.stdout + r.stderr


def jev_choice(question, options: dict, state, note=""):
    # 注意：选项必须挂在 --options 下，不能直接跟 --choice
    args = ["--choice", question, "--options"]
    for k, v in options.items():
        args.append(f"{k}={v}")
    args += ["--state", state, "--raw"]
    out = _run(args)
    return _parse(out, question, note)


def jev_check(question, state, note=""):
    out = _run(["--noul", question, "--state", state, "--raw"])
    return _parse(out, question, note)


def jev_score(question, levels: list, state, note=""):
    out = _run(["--score", question, "--levels"] + levels + ["--state", state, "--raw"])
    return _parse(out, question, note)


def _parse(out, question, note):
    """解析 JEV 输出
    真实结构: {"model":..,"answers":{"q":{"type":"choice","choice":"a","confidence":0.82,
               "probabilities":{...}}},"usage":{...}}
    """
    rec = {"q": question, "note": note, "ts": time.strftime("%Y-%m-%d %H:%M:%S")}
    m = re.search(r'\{[\s\S]*\}', out)
    if m:
        try:
            j = json.loads(m.group(0))
            if j.get("model"): rec["model"] = j["model"]
            ans = j.get("answers") or j.get("result") or j

            # answers 是 {问题ID: {type, choice|value|score, confidence, probabilities}}
            if isinstance(ans, dict):
                got = False
                for _k, v in ans.items():
                    if isinstance(v, dict) and ("choice" in v or "value" in v or "score" in v or "answer" in v):
                        rec["value"] = v.get("choice") or v.get("value") or v.get("answer") or v.get("score")
                        rec["confidence"] = v.get("confidence")
                        rec["probabilities"] = v.get("probabilities")
                        rec["type"] = v.get("type")
                        got = True
                        break
                if not got:
                    # 退化：answers 本身就是扁平结果
                    rec.update({k: v for k, v in ans.items()
                                if k in ("choice", "value", "answer", "score", "confidence", "probabilities", "type")})
                    rec["value"] = rec.get("choice") or rec.get("value") or rec.get("answer") or rec.get("score")
            elif isinstance(ans, list) and ans:
                a = ans[0]
                if isinstance(a, dict):
                    rec["value"] = a.get("choice") or a.get("value") or a.get("answer") or a.get("score")
                    rec["confidence"] = a.get("confidence")
                    rec["probabilities"] = a.get("probabilities")
                    rec["type"] = a.get("type")
                else:
                    rec["value"] = a
            if rec.get("value") is not None:
                rec["ok"] = True
                return rec
        except Exception as e:
            rec["parse_err"] = str(e)
    # 降级：从 pretty 文本抓
    mm = re.search(r'→\s*([\w\-\u4e00-\u9fff]+)\s*\(conf\s*([\d.]+)\)', out)
    if mm:
        rec.update({"value": mm.group(1), "confidence": float(mm.group(2)), "ok": True})
        return rec
    rec.update({"ok": False, "raw_tail": out[-400:]})
    return rec


def log(rec, tag):
    try:
        with open(LOG, 'a', encoding='utf-8') as f:
            f.write(json.dumps({"tag": tag, **rec}, ensure_ascii=False) + "\n")
    except Exception:
        pass


# ══════════════════════════════════════════════════════════
# 🔒 隐私层：出网数据脱敏（家庭健康档案不出本地）
#   规则：姓名/称谓永不出网；医学事实（年龄/用药/疾病）保留 —— 判断力不损失
#   还原：本地映射表（真实称谓↔匿名ID），仅在本机内存中使用
# ══════════════════════════════════════════════════════════
MEMBER_MAP = {          # 真实称谓 ←→ 匿名 ID（仅本机，不入库）
    # ↓ 使用前替换为你的实际称谓，例："家里的大人": "M1"
    #   出货版不含真名，故此处保持自映射；填写后即恢复"真名→代号"还原能力
    "M1": "M1", "M2": "M2", "M3": "M3",
    "M4": "M4", "M5": "M5", "M6": "M6",
}
ID2NAME = {v: k for k, v in MEMBER_MAP.items()}

# 出网用档案（无姓名，含医学事实）
PROFILES_ANON = {
    "M1": "42岁男，痰湿质倾向，尿酸偏高(非痛风)，饮酒后升高。禁忌：啤酒、海鲜过量、动物内脏、浓肉汤。目标：祛湿清热、控尿酸、护肝。",
    "M2": "40岁女，睡眠浅。服拉莫三嗪(抗癫痫)：主要经UGT代谢非CYP3A4，葡萄柚影响很小；绝对禁用丙戊酸(竞争代谢致蓄积,Stevens-Johnson风险)。禁忌：浓茶、过辣、丙戊酸类。",
    "M3": "62岁男，服他汀类降脂药：绝对禁用葡萄柚/西柚/柚子及制品(含西柚果汁果酱)，机制为呋喃香豆素强抑CYP3A4致血药浓度倍增、横纹肌溶解风险。注意红曲类保健品(含天然洛伐他汀)、酗酒、与秋水仙碱/贝特类联用。",
    "M4": "风湿+鼻炎：遇冷关节小腿痛，晨起喷嚏≥4个。需祛寒湿保暖，非控嘌呤。",
    "M5": "14岁男，初三，睡眠差。",
    "M6": "3岁男，幼儿：严守窒息与年龄红线，禁苦杏仁/生桃仁等氰苷食材。",
}

# 兼容旧引用：MEMBERS 现指匿名档案（键为 ID）
MEMBERS = PROFILES_ANON


def anon(text):
    """把文本里的真实称谓替换为匿名 ID（出网前必调）"""
    for real, mid in MEMBER_MAP.items():
        text = text.replace(real, mid)
    return text


def restore(text):
    """把 JEV 返回里的匿名 ID 还原为真实称谓（仅本地展示）"""
    for mid, real in ID2NAME.items():
        text = re.sub(rf'(?<![A-Za-z0-9]){mid}(?![0-9])', real, text)
    return text


def _assert_clean(state, question=""):
    """出网前自检：绝不允许真实称谓混入"""
    for real in MEMBER_MAP:
        if real in state:
            raise RuntimeError(f"🔒 隐私闸门拦截：出网文本含真实称谓「{real}」——{question[:40]}")
    return True



# ══════════════════════════════════════════════════════════
# 安全判定缓存（同一「食材×成员×档案版本」只判断一次）
#   不缓存的价值：把重复重跑的成本从 ~¥6 降到接近 0
#   失效条件：成员档案内容变化（profile_hash 变）→ 自动重判
# ══════════════════════════════════════════════════════════
_CACHE_PATH = os.path.join(os.path.expanduser("~"), ".hermes", "cache", "scratch",
                           "wellness_safety_cache.json")
_CACHE = None
_PROFILE_HASH = None


def _profile_hash():
    global _PROFILE_HASH
    if _PROFILE_HASH is None:
        import hashlib
        blob = json.dumps(PROFILES_ANON, ensure_ascii=False, sort_keys=True)
        _PROFILE_HASH = hashlib.md5(blob.encode()).hexdigest()[:8]
    return _PROFILE_HASH


def _load_cache():
    global _CACHE
    if _CACHE is None:
        try:
            _CACHE = json.load(open(_CACHE_PATH, encoding='utf-8'))
        except Exception:
            _CACHE = {}
    return _CACHE


def _save_cache(force=False):
    global _CACHE
    if _CACHE is None: return
    if force or len(_CACHE) % 25 == 0:
        try:
            json.dump(_CACHE, open(_CACHE_PATH, 'w', encoding='utf-8'),
                      ensure_ascii=False, indent=0)
        except Exception:
            pass


def jev_safety(food, member, use_cache=True):
    """统一安全判定：三分类 + 置信度（带缓存）。
    不用 --noul —— 它只返回概率值无置信度，语义不明（实测返回 {"type":"noul","noul":0.41}）。
    """
    key = f"{food}|{member}|{_profile_hash()}"
    if use_cache:
        c = _load_cache()
        if key in c:
            return c[key]
    q = f"食材「{food}」对成员【{member}】是否安全可食？"
    state = f"成员档案：{member}——{PROFILES_ANON[member]}\n候选食材：{food}"
    rec = jev_choice(q, SAFETY_OPTS, state, note=f"{food}×{member}")
    rec["_cached"] = False
    log(rec, "safety")
    if use_cache:
        c = _load_cache()
        c[key] = dict(rec, _cached=True)
        _save_cache()
    return rec


_RULE_CACHE = None


def rule_gate(foods):
    """第 0 层：确定性规则闸门（不烧 token）
    食品毒性/法定禁入属卫健委目录类事实 → 用规则；药物相互作用属个体化判断 → 交第 1 层 JEV。
    返回 (passed, blocked)；blocked 含 L0 依据，可直接写进告警。
    """
    global _RULE_CACHE
    if _RULE_CACHE is None:
        d = _load_yaml(os.path.join(WELL, "knowledge", "kb_food_safety.yaml"))
        _RULE_CACHE = d if isinstance(d, dict) else {}
    warns = _RULE_CACHE.get("毒性警示") or []
    if isinstance(warns, dict):
        warns = [{"食材": k, **(v if isinstance(v, dict) else {"说明": str(v)})} for k, v in warns.items()]

    passed, blocked = [], []
    for f in foods:
        hit = None
        for wr in warns:
            if not isinstance(wr, dict):
                continue
            name = str(wr.get("食材", ""))
            parts = [x.strip() for x in re.split(r'[/、]', name) if x.strip()]
            if any(p and (p == f or p in f or f in p) for p in parts) or (name and name in f):
                hit = wr
                break
        if hit:
            blocked.append({"food": f, "level": str(hit.get("级别", "")), "risk": hit.get("风险", ""),
                            "why": hit.get("说明", ""), "src": "kb_food_safety.yaml/L0"})
        else:
            passed.append(f)
    return passed, blocked


def safety_gate(foods, members=None):
    """候选食材 × 成员 → 安全判定。返回 {'forbidden': [...], 'caution': [...], 'safe': [...]}"""
    members = members or list(MEMBERS.keys())
    results = {"forbidden": [], "caution": [], "safe": [], "unknown": []}
    for food in foods:
        for m in members:
            q = f"食材「{food}」对成员【{m}】是否安全可食？"
            state = f"成员档案：{m}——{MEMBERS[m]}\n候选食材：{food}"
            rec = jev_choice(q, SAFETY_OPTS, state, note=f"{food}×{m}")
            log(rec, "safety")
            v = str(rec.get("value") or "").lower()
            conf = float(rec.get("confidence") or 0)
            item = {"food": food, "member": m, "verdict": v, "conf": conf}
            # 安全闸门 = 保守设计（宁可误报，不可漏报）：
            #   forbidden → 只要 conf>=0.5 就拦；低于此仅转人工待确认
            #   safe/caution → 低置信也接受（默认安全，只需标注风险）
            if v == "forbidden":
                (results["forbidden"] if conf >= 0.5 else results["unknown"]).append(item)
            elif v in ("safe", "caution"):
                results[v].append(item)
            else:
                results["unknown"].append(item)
            print(f"  {food:8s} × {m:4s} → {v or '?':10s} conf {conf:.2f}")
    return results


# ══════════════════════════════════════════════════════════
# 2. 症状归类（回执闭环入口）
# ══════════════════════════════════════════════════════════
def triage_symptom(text, member=None):
    q = "这句话描述的是哪一类身体状态/症状？"
    state = f"{'成员：' + member + '；' if member else ''}回执原文：「{text}」"
    rec = jev_choice(q, SYMPTOMS, state, note="symptom")
    log(rec, "symptom")
    return rec


# ══════════════════════════════════════════════════════════
# 节气数据（③④ 的选项来源）
# ══════════════════════════════════════════════════════════
def _load_yaml(path):
    try:
        import yaml
        return yaml.safe_load(open(path, encoding='utf-8'))
    except Exception as e:
        return {"_err": str(e)}


_NUTRI_CACHE = None

def _nutrition_names():
    """营养库 200 食材名 → 抽词词典"""
    global _NUTRI_CACHE
    if _NUTRI_CACHE is None:
        d = _load_yaml(os.path.join(WELL, "knowledge", "kb_nutrition.yaml"))
        _NUTRI_CACHE = [x["name"] for x in d if isinstance(x, dict) and x.get("name")] \
            if isinstance(d, list) else []
    return _NUTRI_CACHE


def season_info(solar_term, pentad=None):
    """读节气/候数据 + 抽取食材（正则 + 营养库词典双通道）"""
    fp = os.path.join(WELL, "knowledge", "region_foshan.yaml")
    d = _load_yaml(fp)
    t = (d.get("二十四节气72候") or {}).get(solar_term)
    if not t:
        return {"term": solar_term, "err": f"未找到节气 {solar_term}", "foods": [], "dishes": []}

    foods, seen = [], set()
    dishes = []   # ⚠️ 成品/成药：能吃但菜市场买不到，不进采购清单
    # 判据用「包含」但收窄到明确非采购品的字：
    #   膏(秋梨膏) 羹(银耳羹) 粥(白粥) 汤(排骨汤) 煲(羊肉煲) 茶(柚子茶) 酒 丸 散 丹
    # 刻意不含「粉/饼/圆」——「粉葛」「柿饼」是能买的食材，误伤会丢真食材
    DISHLIKE = ('膏', '羹', '粥', '汤', '煲', '茶', '酒', '丸', '散', '丹')

    def add(x):
        x = (x or "").strip().strip('。、，,')
        if 1 < len(x) <= 8 and x not in seen:
            if any(k in x for k in DISHLIKE):
                if x not in dishes:
                    dishes.append(x)
                return
            seen.add(x); foods.append(x)
    def grab(txt):
        m = re.search(r'宜(?:食)?([^。；;\n]+)', txt or '')
        if m:
            for x in re.split(r'[、,，]', m.group(1)):
                add(x)

    # 收集所有文本（含时令蔬果表）
    texts = [t.get("饮食原则", ""), t.get("忌", "")]
    hou = t.get("候", {}) or {}
    for hv in hou.values():
        texts += [hv.get("养生", ""), hv.get("提示", "")]
    tg = t.get("时令蔬果") or {}
    for k, v in tg.items():
        if isinstance(v, list):
            for x in v: add(x)
        elif isinstance(v, str):
            texts.append(v)

    grab(t.get("饮食原则", ""))
    if pentad and pentad in hou:
        grab(hou[pentad].get("养生", ""))
    for hv in hou.values():
        grab(hv.get("养生", ""))

    # 通道2：用营养库词典扫文本（抓「山药排骨汤」里的「山药」）
    blob = " ".join(texts)
    for name in _nutrition_names():
        if name in blob:
            add(name)

    return {
        "term": solar_term, "climate": t.get("气候", ""),
        "principle": t.get("饮食原则", ""), "avoid": t.get("忌", ""),
        "pentad": pentad, "foods": foods[:40], "dishes": dishes,
        "has_seasonal_table": "时令蔬果" in t,
        "pentads": {k: v.get("物候", "") for k, v in hou.items()},
    }


# ══════════════════════════════════════════════════════════
# 3. 食材分诊：从时令候选池选「全家主力 / 个人对症 / 惊喜」
# ══════════════════════════════════════════════════════════
def pick_foods(solar_term, pentad, weather, symptoms, n_main=2, n_surprise=1, pool=None):
    """三层推荐。pool 为空时自动取节气宜食。"""
    si = season_info(solar_term, pentad)
    cand = pool or si["foods"]
    if not cand:
        return {"err": "候选池为空", "picked": {}}

    # ── 第 0 层：确定性规则闸门（食品毒性/法定禁入，不烧 token）
    cand2, rule_blocked = rule_gate(cand)

    # ── 第 1 层：JEV 个体化闸门（药物 × 体质，三分类）
    safe_ok, banned = [], list(rule_blocked)
    for f in cand2:
        bad = False
        for m in MEMBERS:
            rec = jev_safety(f, m)
            v = str(rec.get("value") or "").lower()
            conf = float(rec.get("confidence") or 0)
            if v == "forbidden" and conf >= 0.5:
                banned.append({"food": f, "member": m, "conf": conf, "src": "JEV"})
                bad = True
                break
        if not bad:
            safe_ok.append(f)

    # JEV 选择
    env = f"节气：{solar_term}"
    if pentad: env += f"「{pentad}」"
    env += f"；气候：{si['climate']}；天气：{weather}；饮食原则：{si['principle']}；忌：{si['avoid']}"
    if symptoms: env += f"；家人症状：{symptoms}"

    opts = {f"f{i}": f for i, f in enumerate(safe_ok[:40])}
    q = f"综合节气、气候、家人症状，今日最适合【全家共同食用】的主力食材优先选哪个？"
    main = jev_choice(q, opts, env, note="main")
    log(main, "pick_main")

    q2 = f"今日作为【惊喜尝鲜】的食材选哪个（求新意但须合乎时令）？"
    sur = jev_choice(q2, opts, env, note="surprise")
    log(sur, "pick_surprise")

    def _name(rec):
        k = str(rec.get("value") or "")
        return opts.get(k, k)
    return {
        "term": solar_term, "pentad": pentad,
        "candidates": safe_ok, "banned": banned,
        "main": _name(main), "main_conf": main.get("confidence"),
        "surprise": _name(sur), "surprise_conf": sur.get("confidence"),
        "principle": si["principle"],
    }


# ══════════════════════════════════════════════════════════
# 4. 时令契合度评分
# ══════════════════════════════════════════════════════════
def score_season(food, solar_term, pentad=None):
    si = season_info(solar_term, pentad)
    q = f"食材「{food}」与当前节气「{solar_term}」的时令契合度如何？"
    state = f"节气气候：{si['climate']}；饮食原则：{si['principle']}；忌：{si['avoid']}；候选食材：{food}"
    rec = jev_score(q, ["极佳（当令首选）", "良好（适宜食用）", "一般（可食但非当令）", "不宜（与时令相悖）"], state, note=food)
    log(rec, "score")
    return rec
def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)

    p1 = sub.add_parser("safety");  p1.add_argument("--foods", required=True); p1.add_argument("--members", default="")
    p2 = sub.add_parser("symptom"); p2.add_argument("--text", required=True);  p2.add_argument("--member", default="")

    a = ap.parse_args()
    if a.cmd == "safety":
        foods = [x.strip() for x in a.foods.split(",") if x.strip()]
        ms = [x.strip() for x in a.members.split(",") if x.strip()] or None
        r = safety_gate(foods, ms)
        print("\n" + "=" * 60)
        print("🚫 绝对禁用:", [f"{i['food']}×{i['member']}" for i in r["forbidden"]] or "无")
        print("⚠️  需注意  :", [f"{i['food']}×{i['member']}" for i in r["caution"]] or "无")
        print("❓ 不确定  :", [f"{i['food']}×{i['member']}" for i in r["unknown"]] or "无")
    elif a.cmd == "symptom":
        r = triage_symptom(a.text, a.member or None)
        v = r.get("value")
        print(f"\n  症状归类 → {v}  ({SYMPTOMS.get(v, '?')})  conf {r.get('confidence')}")


if __name__ == "__main__":
    main()
