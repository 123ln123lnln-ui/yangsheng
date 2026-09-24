import type { Constitution } from './constitutions';

export type Food = {
  name: string;
  category: '蔬' | '果' | '谷' | '肉' | '海' | '菌' | '药' | '调' | '豆' | '干' | '茶' | '油' | '其他';
  nature: string;
  taste: string;
  meridian: string;
  effect: string;
  fit: Constitution[];
  avoid: Constitution[];
  months: number[];
  processTip?: string; // 加工搭配建议
};

export const foods: Food[] = [
  { name: '山药', category: '蔬', nature: '平', taste: '甘', meridian: '脾肺肾', effect: '健脾益肺、补肾固精', fit: ['气虚质', '阳虚质', '痰湿质'], avoid: [], months: [9,10,11,12,1], processTip: '配芡实煮粥，补脾效果更佳' },
  { name: '核桃', category: '干', nature: '温', taste: '甘', meridian: '肾肺大肠', effect: '补肾助阳、润肠通便', fit: ['阳虚质'], avoid: ['湿热质'], months: [9,10,11], processTip: '琥珀核桃或入药膳' },
  { name: '绿茶', category: '茶', nature: '寒', taste: '苦甘', meridian: '心肝', effect: '清热解毒、利尿', fit: ['湿热质'], avoid: ['阳虚质'], months: [4,5,6], processTip: '不宜空腹饮用，配玫瑰花可疏肝' },
  { name: '芝麻油', category: '油', nature: '凉', taste: '甘', meridian: '大肠', effect: '润燥通便', fit: ['阴虚质'], avoid: ['痰湿质'], months: [1,2,3,4,5,6,7,8,9,10,11,12], processTip: '凉拌蔬菜，保留活性' },
  { name: '薏米', category: '谷', nature: '凉', taste: '甘淡', meridian: '脾肺', effect: '利水渗湿、健脾止泻', fit: ['痰湿质', '湿热质'], avoid: ['阳虚质'], months: [7,8,9] },
  { name: '赤小豆', category: '谷', nature: '平', taste: '甘酸', meridian: '心小肠', effect: '利水消肿、清热解毒', fit: ['痰湿质', '湿热质'], avoid: [], months: [8,9,10] },
  { name: '冬瓜', category: '蔬', nature: '凉', taste: '甘淡', meridian: '肺大肠', effect: '清热利水、消肿解暑', fit: ['湿热质', '痰湿质'], avoid: ['阳虚质'], months: [6,7,8,9] },
  { name: '苦瓜', category: '蔬', nature: '寒', taste: '苦', meridian: '心脾胃', effect: '清热解毒、明目除烦', fit: ['湿热质', '阴虚质'], avoid: ['阳虚质', '气虚质'], months: [6,7,8] },
  { name: '绿豆', category: '谷', nature: '凉', taste: '甘', meridian: '心胃', effect: '清热解暑、利水消肿', fit: ['湿热质'], avoid: ['阳虚质'], months: [6,7,8] },
  { name: '银耳', category: '菌', nature: '平', taste: '甘淡', meridian: '肺胃肾', effect: '滋阴润肺、养胃生津', fit: ['阴虚质'], avoid: [], months: [9,10,11] },
  { name: '百合', category: '蔬', nature: '寒', taste: '甘', meridian: '心肺', effect: '润肺止咳、清心安神', fit: ['阴虚质'], avoid: ['阳虚质'], months: [7,8,9] },
  { name: '梨', category: '果', nature: '凉', taste: '甘微酸', meridian: '肺胃', effect: '生津润燥、清热化痰', fit: ['阴虚质', '湿热质'], avoid: ['阳虚质'], months: [8,9,10] },
  { name: '羊肉', category: '肉', nature: '温', taste: '甘', meridian: '脾肾', effect: '温中补虚、益肾壮阳', fit: ['阳虚质', '气虚质'], avoid: ['湿热质', '阴虚质'], months: [11,12,1,2] },
  { name: '生姜', category: '调', nature: '温', taste: '辛', meridian: '肺脾胃', effect: '温中散寒、发汗解表', fit: ['阳虚质', '痰湿质'], avoid: ['阴虚质'], months: [1,2,3,4,5,6,7,8,9,10,11,12] },
  { name: '桂圆', category: '果', nature: '温', taste: '甘', meridian: '心脾', effect: '补益心脾、养血安神', fit: ['气虚质', '阳虚质', '血瘀质'], avoid: ['湿热质', '阴虚质'], months: [7,8] },
  { name: '黄芪', category: '药', nature: '温', taste: '甘', meridian: '脾肺', effect: '补气固表、利水', fit: ['气虚质', '阳虚质'], avoid: ['阴虚质', '湿热质'], months: [] },
  { name: '小米', category: '谷', nature: '凉', taste: '甘咸', meridian: '脾胃肾', effect: '健脾和胃、补虚安眠', fit: ['气虚质', '阴虚质'], avoid: [], months: [9,10] },
  { name: '陈皮', category: '药', nature: '温', taste: '辛苦', meridian: '脾肺', effect: '理气健脾、燥湿化痰', fit: ['气郁质', '痰湿质'], avoid: ['阴虚质'], months: [] },
  { name: '玫瑰花', category: '药', nature: '温', taste: '甘微苦', meridian: '肝脾', effect: '疏肝解郁、活血调经', fit: ['气郁质', '血瘀质'], avoid: [], months: [4,5] },
  { name: '山楂', category: '果', nature: '微温', taste: '酸甘', meridian: '脾胃肝', effect: '消食化积、活血散瘀', fit: ['血瘀质', '痰湿质'], avoid: ['气虚质'], months: [9,10,11] },
  { name: '黑木耳', category: '菌', nature: '平', taste: '甘', meridian: '胃大肠', effect: '补气养血、润肺通便', fit: ['血瘀质', '气虚质'], avoid: [], months: [8,9,10] },
  { name: '白萝卜', category: '蔬', nature: '凉', taste: '辛甘', meridian: '肺胃', effect: '下气消食、化痰止咳', fit: ['痰湿质', '湿热质'], avoid: ['气虚质'], months: [10,11,12,1] },
  { name: '芹菜', category: '蔬', nature: '凉', taste: '甘苦', meridian: '肝胃', effect: '平肝清热、利湿', fit: ['湿热质', '血瘀质'], avoid: ['阳虚质'], months: [3,4,11,12] },
  { name: '南瓜', category: '蔬', nature: '温', taste: '甘', meridian: '脾胃', effect: '补中益气、健脾', fit: ['气虚质', '阳虚质'], avoid: ['湿热质'], months: [7,8,9,10] },
  { name: '苹果', category: '果', nature: '凉', taste: '甘酸', meridian: '脾肺', effect: '生津润肺、健脾', fit: ['阴虚质', '湿热质'], avoid: [], months: [9,10,11] },
  { name: '胡萝卜', category: '蔬', nature: '平', taste: '甘', meridian: '肺脾', effect: '健脾消食、补肝明目', fit: ['气虚质', '痰湿质'], avoid: [], months: [10,11,12,1] },
  { name: '豆腐', category: '豆', nature: '凉', taste: '甘', meridian: '脾胃大肠', effect: '益气和中、清热润燥', fit: ['阴虚质', '湿热质'], avoid: ['阳虚质'], months: [] },
];

export const teasByZang = {
  脾: [{ name: '陈皮山楂茶', formula: '陈皮3g + 山楂5g 泡水', effect: '健脾消食、理气化湿' }, { name: '四神汤', formula: '茯苓、莲子、山药、芡实同煮', effect: '健脾祛湿、温和滋补' }],
  肝: [{ name: '玫瑰菊花茶', formula: '玫瑰3朵 + 菊花5朵', effect: '疏肝解郁、清肝明目' }],
  心: [{ name: '莲子百合羹', formula: '莲子、百合、冰糖炖煮', effect: '清心安神、润燥' }],
  肺: [{ name: '银耳雪梨羹', formula: '银耳、雪梨、冰糖炖煮', effect: '滋阴润肺、止咳生津' }],
  肾: [{ name: '黑芝麻核桃糊', formula: '黑芝麻、核桃打粉冲服', effect: '补肾润肠' }],
} as const;
