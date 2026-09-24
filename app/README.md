# 家和养生 Android App

基于 Expo React Native 的家庭中医养生助手原型，迁移自 `家和养生.html` 和 PRD。

## 已实现

- 今日养生：按成员体质、所在地、2026 年节气、季节天气规则输出建议
- 食材库：展示食材性味、五味、归经、功效、适宜/慎食体质、月份
- 共餐搭配：综合全家成员体质筛选共餐食材，并给每位成员差异化提示
- 家人管理：本地新增成员、体质、健康标签、忌口/过敏
- 设置页：大模型配置按钮，默认 `DeepSeek V4 Pro`
- 本地数据持久化：AsyncStorage

## 数据准确性策略

- 节气：使用 2026 年节气日期表，不再用固定月日粗略推断
- 食材推荐：先走本地结构化规则（节气/月令、体质、忌口、过敏、健康标签），大模型只应做文案组织
- 特殊人群：孕期、糖尿病、高血压、痛风会强制展示保守提醒
- 医疗边界：所有建议仅供养生参考，不构成医疗诊断/治疗/用药建议

上线前仍建议：请中医顾问审核食材库、体质问卷和特殊人群禁忌。

## 开发运行

```bash
npm install
npm start
```

安卓设备运行：

```bash
npm run android
```

如果没有本地 Android SDK，建议使用 Expo Go 扫码预览，或用 EAS 云构建。

## 打 Android 安装包

安装 EAS CLI：

```bash
npm install -g eas-cli
```

登录并配置：

```bash
eas login
eas build:configure
```

构建 APK/AAB：

```bash
eas build -p android --profile preview
```

## 大模型配置

设置页默认：

- Provider: `DeepSeek`
- Model: `DeepSeek V4 Pro`
- Endpoint: `https://api.deepseek.com/chat/completions`

当前版本仅保存配置；正式接入时，应把规则过滤后的候选食材、节气、天气、体质作为输入传给模型，禁止让模型直接绕过禁忌规则生成建议。
