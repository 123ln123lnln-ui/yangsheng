#!/usr/bin/env python3
"""养生日记处理器
用法:
  python3 wellness_journal.py show                # 查看今日日记
  python3 wellness_journal.py M1 mood 好         # 记录心情
  python3 wellness_journal.py M1 recipe 冬瓜老鸭汤 # 记录食谱
  python3 wellness_journal.py M1 exercise 散步30分钟
  python3 wellness_journal.py M4 joint 痛        # 关节状态
  python3 wellness_journal.py M1 uric 偏高       # 尿酸
  python3 wellness_journal.py all note 今日全家喝汤

写入 state/daily_log/YYYY-MM-DD.yaml
"""
import os, sys, yaml
from datetime import datetime
from pathlib import Path

STATE_DIR = Path(os.environ.get('WELLNESS_BASE', 'I:/华为云盘/00 soul/01_Projects/wellness')) / 'state' / 'daily_log'
STATE_DIR.mkdir(parents=True, exist_ok=True)

VALID_MEMBERS = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'all']

def log(member, field, value):
    today = datetime.now().strftime('%Y-%m-%d')
    log_file = STATE_DIR / f'{today}.yaml'
    data = {}
    if log_file.exists():
        with open(log_file, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f) or {}

    targets = VALID_MEMBERS if member == 'all' else [member]
    for m in targets:
        if m == 'all': continue
        data.setdefault(m, {})[field] = value

    with open(log_file, 'w', encoding='utf-8') as f:
        yaml.dump(data, f, allow_unicode=True, default_flow_style=False)
    print(f"✅ {member}.{field} = {value} → {log_file}")

def show():
    today = datetime.now().strftime('%Y-%m-%d')
    log_file = STATE_DIR / f'{today}.yaml'
    if log_file.exists():
        with open(log_file, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)
        print(f"📋 {today} 养生记录：")
        for member, fields in data.items():
            items = ', '.join(f'{k}={v}' for k,v in fields.items())
            print(f"  {member}: {items}")
    else:
        print(f"📋 {today}: 暂无记录")

def week():
    """显示近7天摘要"""
    from datetime import timedelta
    today = datetime.now()
    for i in range(6, -1, -1):
        d = (today - timedelta(days=i)).strftime('%Y-%m-%d')
        f = STATE_DIR / f'{d}.yaml'
        if f.exists():
            with open(f, 'r', encoding='utf-8') as fh:
                data = yaml.safe_load(fh)
            members_with_data = [m for m, v in data.items() if v]
            print(f"  {d}: {len(members_with_data)}人记录 ({', '.join(members_with_data)})")
        else:
            print(f"  {d}: -")

if __name__ == '__main__':
    if len(sys.argv) == 1 or sys.argv[1] == 'show':
        show()
    elif sys.argv[1] == 'week':
        week()
    elif len(sys.argv) >= 3:
        member, field = sys.argv[1], sys.argv[2]
        value = sys.argv[3] if len(sys.argv) > 3 else 'yes'
        log(member, field, value)
    else:
        print("用法:")
        print("  python3 wellness_journal.py show              # 今日日记")
        print("  python3 wellness_journal.py week              # 近7天摘要")
        print("  python3 wellness_journal.py [成员] [字段] [值]")
        print("  成员: M1 M2 M3 M4 M5 M6 all")
        print("  字段: sleep mood recipe exercise joint uric note")
        print("  示例:")
        print("    M1 recipe 冬瓜薏米老鸭汤")
        print("    M1 mood 好")
        print("    M1 exercise 散步30分钟")
        print("    M4 joint 痛")
        print("    M1 uric 偏高")
