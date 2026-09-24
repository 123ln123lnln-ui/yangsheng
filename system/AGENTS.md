# 家庭古法养生推送系统 · AGENTS.md

> 下次新会话读此文件即可恢复全部上下文。

## 一句话定位
基于72候物候+天气+家庭六人档案+五库知识，每日自动生成个性化养生推送的定时任务系统。

## 怎么跑
- **平台**: Hermes cron（Windows本地，7×24需要电脑开机）
- **定时任务**: 7个cron job → `cronjob action='list'` 查看
- **核心脚本**: `~/.hermes/scripts/wellness/` 下4个py文件
- **数据目录**: `I:/华为云盘/00 soul/01_Projects/wellness/`

## 技术栈
- Hermes cron + DeepSeek v4-pro (LLM任务)
- Python 3 (no_agent脚本)
- YAML (知识库+档案+日志)
- wttr.in (免费天气API)
- 飞书 (推送通道)

## 目录结构
```
I:/华为云盘/00 soul/01_Projects/wellness/
├── knowledge/          # 五库YAML（92分A级）
│   ├── kb_classics.yaml       100味本草+内经
│   ├── kb_drug_interactions.yaml  22条药物
│   ├── kb_food_safety.yaml     106药食同源+18毒性
│   ├── kb_nutrition.yaml       200种食材营养
│   └── region_foshan.yaml      24节气×72候
├── state/              # 运行时状态
│   ├── family_profiles.yaml    六人档案（v2.1）
│   ├── daily_log/              YYYY-MM-DD.yaml 每日回执
│   ├── rotation_log.yaml       14天轮换记录
│   └── weather_today.json      天气缓存（30分钟刷新）
└── ~/.hermes/scripts/wellness/  # 脚本
    ├── morning_card.py         通用早安（no_agent保底）
    ├── term_alert.py           节气预警（no_agent）
    ├── weather_fetch.py        天气采集（30min cron）
    └── wellness_journal.py     养生日记（手动触发）
```

## 关键规则（不要搞错）
- **敏**(他汀)→忌西柚(CYP3A4) — 全家唯一绝对忌西柚
- **M2**(拉莫三嗪)→禁丙戊酸。西柚影响很小(UGT代谢非CYP3A4)
- **M1**→尿酸偏高，控啤酒/海鲜/内脏/浓汤
- **M4**→风湿关节痛+鼻炎(遇冷发作)，祛寒湿保暖——非痛风！
- **M6**→去刺去核，禁整粒坚果+蜂蜜
- **M5**→禁咖啡因+大补药材

## 每日推送时间线
```
07:00  通用早安卡（no_agent保底）
07:02  节气预警（no_agent，有临近节气才发）
07:13  早安个性护航（LLM，读9数据源）
20:00  次日备膳卡（LLM，含回执指令）
```
