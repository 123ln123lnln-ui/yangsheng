export const constitutions = {
  平和质: { icon: '😊', desc: '阴阳气血调和，体态适中，精力充沛，睡眠良好。', care: '饮食有节，劳逸结合，维持规律作息。' },
  气虚质: { icon: '😮‍💨', desc: '易疲乏、气短、易出汗、容易感冒。', care: '补气健脾，宜山药、小米等，避免过劳与生冷。' },
  阳虚质: { icon: '🥶', desc: '怕冷、手脚发凉、喜热饮食、精神不振。', care: '温补阳气，注意保暖，少食寒凉冰冷。' },
  阴虚质: { icon: '🔥', desc: '手脚心热、口干咽燥、易上火。', care: '滋阴润燥，少食辛辣温燥。' },
  痰湿质: { icon: '💧', desc: '体形偏胖、易困倦、痰多或腹部松软。', care: '健脾化湿，少食肥甘厚腻。' },
  湿热质: { icon: '♨️', desc: '面垢油光、易生痤疮、口苦口黏。', care: '清热利湿，少食辛辣油腻烧烤。' },
  血瘀质: { icon: '🩸', desc: '肤色晦暗、易有瘀斑、口唇偏暗。', care: '适度运动，避免久坐，饮食可偏活血化瘀。' },
  气郁质: { icon: '😔', desc: '情绪低落、容易紧张焦虑、胸闷叹气。', care: '疏肝解郁，多户外活动与规律社交。' },
  特禀质: { icon: '🤧', desc: '过敏体质，易过敏、哮喘、荨麻疹等。', care: '益气固表，避开已知过敏原。' },
} as const;

export type Constitution = keyof typeof constitutions;

export const constitutionList = Object.keys(constitutions) as Constitution[];

export const healthTags = ['高血压', '糖尿病', '高血脂', '孕期', '哺乳期', '术后恢复', '痛风', '胃寒', '失眠', '便秘'] as const;
export const avoidTags = ['海鲜', '辛辣', '生冷', '油腻', '酒', '咖啡', '花生', '牛奶'] as const;
