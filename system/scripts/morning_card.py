#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""养生早安行动卡 — 07:00推送。print+flush，兼容cron runner subprocess。"""
import sys
from datetime import datetime

def log(msg):
    print(msg, flush=True)
    sys.stdout.flush()

def get_season():
    m = datetime.now().month
    if m in [3,4,5]: return "春"
    if m in [6,7,8]: return "夏"
    if m in [9,10,11]: return "秋"
    return "冬"

def get_shichen():
    h = datetime.now().hour
    if 5 <= h < 7: return "卯时"
    if 7 <= h < 9: return "辰时"
    return None

# 四季数据（内嵌，不依赖外部文件）
SEASONAL = {
    "春": {"原文":"春三月，此谓发陈。夜卧早起，广步于庭，被发缓形，以使志生","原则":"养阳疏肝","饮食":"省酸增甘，以养脾气"},
    "夏": {"原文":"夏三月，此谓蕃秀。夜卧早起，无厌于日，使志无怒","原则":"养心清暑","饮食":"省苦增辛，以养肺气"},
    "秋": {"原文":"秋三月，此谓容平。早卧早起，与鸡俱兴，使志安宁","原则":"养肺润燥","饮食":"省辛增酸，以养肝气"},
    "冬": {"原文":"冬三月，此谓闭藏。早卧晚起，必待日光，使志若伏若匿","原则":"养肾藏精","饮食":"省咸增苦，以养心气"},
}

SHICHEN = {
    "卯时":{"时间":"5:00-7:00","宜":"晨起一杯温水、排便"},
    "辰时":{"时间":"7:00-9:00","宜":"早餐吃好，温热易消化"},
    "巳时":{"时间":"9:00-11:00","宜":"饮温水，适度活动"},
    "午时":{"时间":"11:00-13:00","宜":"午休15-30分钟养心"},
    "未时":{"时间":"13:00-15:00","宜":"午餐细嚼慢咽"},
    "申时":{"时间":"15:00-17:00","宜":"多喝水、适度活动"},
    "酉时":{"时间":"17:00-19:00","宜":"晚餐宜少，补肾气"},
    "戌时":{"时间":"19:00-21:00","宜":"散步、放松心情"},
    "亥时":{"时间":"21:00-23:00","宜":"泡脚、入睡准备"},
}

def main():
    today = datetime.now()
    season = get_season()
    s = SEASONAL.get(season, {})

    log(f"🌅 早安 · {today.strftime('%m月%d日')} · {season}季")
    log("")

    # 时辰
    sc_name = get_shichen()
    if sc_name:
        sc = SHICHEN.get(sc_name, {})
        log(f"⏰ {sc_name}({sc.get('时间','')}) → {sc.get('宜','')}")
        log("")

    # 季节总则
    log(f"📜 《四气调神大论》：「{s.get('原文','')[:50]}…」")
    log(f"💡 {s.get('原则','')} | {s.get('饮食','')}")

    # 年度提示
    log("🌏 丙午年：水火交争之年，注意心肾不交、失眠上火，宜滋阴降火、交通心肾")

    # 宜忌
    log("")
    log("✅ 宜：晨起温水、午休15分钟、亥时泡脚")
    log("❌ 忌：空腹出门、熬夜刷手机、大饮冷饮")

if __name__ == "__main__":
    main()
