# 养生系统 · yangsheng

家庭养生知识库 + 判断层 + 移动端 App。

## 目录
| 路径 | 内容 |
|---|---|
| `app/` | React Native (Expo) 移动端 — 体质、食材、节气、食材库、家庭成员 |
| `system/knowledge/` | 知识库 YAML：经典、药物相互作用、食品安全、营养、时令地区 |
| `system/scripts/` | Python：判断层、周报、节气提醒、天气、日记 |
| `system/AGENTS.md` | 家庭健康规则（**成员以代号 M1–M6 表示**）|
| `docs/` | 文档 |

## 🔒 隐私说明（重要）
- 真实家庭档案 `system/state/family_profiles.yaml` **不入库**（见 `.gitignore`）
- 首次使用：`cp system/state/family_profiles.example.yaml system/state/family_profiles.yaml` 后填写
- 成员一律用代号（M1…M6），**仓库不含任何真实姓名、学校、住址**
- 判断层调用外部模型时只传代号与医学事实，不传姓名

## 快速开始
```bash
# App
cd app && npm i && npx expo start

# 系统
cp system/state/family_profiles.example.yaml system/state/family_profiles.yaml
python system/scripts/weekly_wellness.py
```

## 合并来源
本仓库合并了两个历史仓库（`yangsheng` private 的 Expo 标准配置 + `jiahe-yangsheng-app` public 的 Family/Food/Meal 三个页面），并在其基础上整合了 Python 判断层与知识库。

## 免责声明
`kb_drug_interactions.yaml`、`kb_food_safety.yaml` 为通用医学知识整理，**不构成医疗建议**；用药、剂量、禁忌请遵医嘱。
