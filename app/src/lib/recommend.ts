import { foods } from '../data/foods';
import { currentSolarTerm, seasonOf } from '../data/solarTerms';
import type { Member } from './storage';

export function weatherBySeason() {
  const season = seasonOf();
  if (season === '春') return { text: '18℃ 多云转晴', tip: '乍暖还寒，注意春捂，护住颈背与脚踝。' };
  if (season === '夏') return { text: '32℃ 闷热有雷阵雨', tip: '高温多湿，多补水，避免正午外出与贪凉。' };
  if (season === '秋') return { text: '21℃ 晴朗干燥', tip: '空气干燥，注意补水润燥，护肤防皲裂。' };
  return { text: '6℃ 阴冷', tip: '天气寒冷，注意保暖，温热饮食护阳气。' };
}

export function recommendationFor(member: Member) {
  const term = currentSolarTerm();
  const month = new Date().getMonth() + 1;
  const seasonal = foods.filter((food) => food.months.length === 0 || food.months.includes(month));
  const allergyFiltered = seasonal.filter((food) => {
    if (member.avoidList.includes('海鲜') && food.category === '海') return false;
    if (member.avoidList.includes('生冷') && ['寒', '凉', '微寒'].includes(food.nature)) return false;
    return true;
  });
  const fit = allergyFiltered.filter((food) => {
    // 只要成员的任一体质在食材禁忌中，就排除
    if (member.constitutions.some(c => food.avoid.includes(c))) return false;
    // 如果食材没有特定适合体质，或成员任一体质在适合列表中，则推荐
    return food.fit.length === 0 || member.constitutions.some(c => food.fit.includes(c));
  });
  const avoid = seasonal.filter((food) => member.constitutions.some(c => food.avoid.includes(c)));
  return { term, weather: weatherBySeason(), fit: fit.slice(0, 8), avoid: avoid.slice(0, 5) };
}

export function safetyNote(member: Member) {
  const notes = [];
  if (member.healthTags.includes('孕期')) notes.push('孕期体质特殊，活血、寒凉、滑利食材请谨慎。');
  if (member.healthTags.includes('糖尿病')) notes.push('控糖人群请控制高糖摄入。');
  if (member.healthTags.includes('高血压')) notes.push('低盐饮食，清淡为主。');
  if (member.healthTags.includes('痛风')) notes.push('低嘌呤饮食，少食浓汤。');
  
  // 针对新症状标签的动态提醒
  if (member.healthTags.includes('手脚冰凉')) notes.push('建议多食温热食物，每晚泡脚。');
  if (member.healthTags.includes('失眠多梦')) notes.push('晚饭不宜过饱，可食百合小米粥。');
  if (member.healthTags.includes('眼睛干涩')) notes.push('宜食枸杞、菊花，控制用眼时长。');

  return notes.length > 0 ? notes.join(' ') : '本建议仅供日常养生参考。';
}
