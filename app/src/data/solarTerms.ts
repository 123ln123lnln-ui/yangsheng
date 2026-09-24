export type SolarTermName =
  | '小寒' | '大寒' | '立春' | '雨水' | '惊蛰' | '春分' | '清明' | '谷雨'
  | '立夏' | '小满' | '芒种' | '夏至' | '小暑' | '大暑' | '立秋' | '处暑'
  | '白露' | '秋分' | '寒露' | '霜降' | '立冬' | '小雪' | '大雪' | '冬至';

export type SolarTerm = {
  name: SolarTermName;
  date: string;
  zang: '肝' | '心' | '脾' | '肺' | '肾';
  focus: string;
  advice: string;
  mindAdvice?: string;
};

export const solarTerms2026: SolarTerm[] = [
  { name: '小寒', date: '2026-01-05', zang: '肾', focus: '温补脾肾、养血御寒', advice: '最冷时节，宜温补气血，护好头颈足。' },
  { name: '大寒', date: '2026-01-20', zang: '肾', focus: '温阳散寒、健脾补肾', advice: '寒极将春，温补兼顾疏通，迎接生发。' },
  { name: '立春', date: '2026-02-04', zang: '肝', focus: '养肝护阳、舒展生发', advice: '早睡早起，多伸展，少酸增甘以养脾。' },
  { name: '雨水', date: '2026-02-19', zang: '脾', focus: '健脾祛湿、调畅情志', advice: '乍暖还寒，注意保暖，饮食宜温和清淡。' },
  { name: '惊蛰', date: '2026-03-05', zang: '肝', focus: '养肝防风、生发阳气', advice: '多吃清淡甘润食物，预防春困与过敏。' },
  { name: '春分', date: '2026-03-20', zang: '肝', focus: '阴阳平衡、疏肝健脾', advice: '昼夜均分，宜调和五味，忌大寒大热。' },
  { name: '清明', date: '2026-04-05', zang: '肝', focus: '清肝降火、柔肝养血', advice: '踏青舒展，少食发物，多食时令青绿。' },
  { name: '谷雨', date: '2026-04-20', zang: '脾', focus: '祛湿健脾、养护脾胃', advice: '湿气渐重，宜健脾利湿，少食生冷。' },
  { name: '立夏', date: '2026-05-05', zang: '心', focus: '养心安神、清热生津', advice: '晚睡早起，午间小憩，戒躁戒怒以养心。' },
  { name: '小满', date: '2026-05-21', zang: '脾', focus: '健脾祛湿、清热防燥', advice: '闷热多湿，宜苦味清心，忌肥甘厚腻。' },
  { name: '芒种', date: '2026-06-05', zang: '心', focus: '清热祛湿、生津止渴', advice: '天热汗多，及时补水，饮食清淡易消化。' },
  { name: '夏至', date: '2026-06-21', zang: '心', focus: '养心护阳、清暑益气', advice: '一年阳盛之极，忌贪凉饮冷，午休养神。' },
  { name: '小暑', date: '2026-07-07', zang: '心', focus: '清热解暑、健脾养心', advice: '暑湿交蒸，宜清补，多食瓜类利水。' },
  { name: '大暑', date: '2026-07-23', zang: '脾', focus: '清热解暑、健脾化湿', advice: '最热时节，可适当以热制热，忌冰镇暴食。' },
  { name: '立秋', date: '2026-08-07', zang: '肺', focus: '养肺润燥、收敛阳气', advice: '暑热未消，宜滋阴润燥，少辛增酸。' },
  { name: '处暑', date: '2026-08-23', zang: '肺', focus: '润肺防燥、调养脾胃', advice: '暑去秋来，早睡早起，多食滋润食物。' },
  { name: '白露', date: '2026-09-07', zang: '肺', focus: '润肺生津、防燥护阴', advice: '昼夜温差大，注意保暖，养肺为先。' },
  { name: '秋分', date: '2026-09-23', zang: '肺', focus: '滋阴润肺、平衡阴阳', advice: '宜收不宜散，多食白色润燥之物。' },
  { name: '寒露', date: '2026-10-08', zang: '肺', focus: '润燥养肺、温补防寒', advice: '添衣保暖，足部尤需护暖，宜温润饮食。' },
  { name: '霜降', date: '2026-10-23', zang: '脾', focus: '健脾养胃、平补润燥', advice: '秋季最后节气，宜平补，固护脾胃。' },
  { name: '立冬', date: '2026-11-07', zang: '肾', focus: '养肾藏精、温补御寒', advice: '早睡晚起，适度温补，养藏阳气。' },
  { name: '小雪', date: '2026-11-22', zang: '肾', focus: '温补肾阳、养护心神', advice: '天寒地冻，宜温热饮食，调畅情志。' },
  { name: '大雪', date: '2026-12-07', zang: '肾', focus: '补肾助阳、温养气血', advice: '进补好时节，宜温补，注意保暖防寒。' },
  { name: '冬至', date: '2026-12-22', zang: '肾', focus: '养肾固本、扶阳固元', advice: '一年阴盛之极，冬至进补，温养肾阳。' },
];

export function currentSolarTerm(date = new Date()): SolarTerm {
  const y = date.getFullYear();
  const table = y === 2026 ? solarTerms2026 : solarTerms2026;
  const today = date.toISOString().slice(0, 10);
  let current = table[table.length - 1]!;
  for (const term of table) {
    if (today >= term.date) current = term;
  }
  return current;
}

export function seasonOf(date = new Date()): '春' | '夏' | '秋' | '冬' {
  const m = date.getMonth() + 1;
  if (m >= 3 && m <= 5) return '春';
  if (m >= 6 && m <= 8) return '夏';
  if (m >= 9 && m <= 11) return '秋';
  return '冬';
}
