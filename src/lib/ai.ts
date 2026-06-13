import type { AppState } from './storage';

export async function askSenseNova(state: AppState, prompt: string) {
  if (!state.model.apiKey) return "请在管理页面配置 API Key 以启用 AI 功能。";

  try {
    const response = await fetch(state.model.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.model.apiKey}`
      },
      body: JSON.stringify({
        model: state.model.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    });
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (e) {
    return "AI 响应失败，请检查网络或 API Key。";
  }
}

/**
 * 将 AI 的普通文本转化为结构化信息图数据
 */
export function formatAsInfographic(text: string) {
  // 这里可以做一些简单的解析逻辑，将文本拆分为：核心结论、详细建议、禁忌提醒等
  return {
    title: 'SenseNova 养生洞察',
    summary: text.slice(0, 50) + '...',
    details: text,
    timestamp: new Date().toLocaleString()
  };
}
