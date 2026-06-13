import React from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { constitutions, type Constitution } from '../data/constitutions';
import { teasByZang } from '../data/foods';
import { recommendationFor, safetyNote } from '../lib/recommend';
import type { AppState } from '../lib/storage';
import { styles, colors } from '../components/styles';
import { Pill } from '../components/Pill';
import { AIInfographic } from '../components/AIInfographic';
import { askSenseNova } from '../lib/ai';

export function HomeScreen({ state }: { state: AppState }) {
  const [aiInsight, setAiInsight] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const currentMember = state.members.find((m) => m.id === state.currentMemberId);
  const member = currentMember || state.members[0];
  
  if (!member) {
    return <View style={styles.screen}><Text>正在初始化数据...</Text></View>;
  }

  // 防御性处理体质数据
  const safeConstitutions: Constitution[] = Array.isArray(member.constitutions) && member.constitutions.length > 0 
    ? member.constitutions 
    : ['平和质'];

  const rec = recommendationFor({ ...member, constitutions: safeConstitutions });

  const getAIInsight = async () => {
    setLoading(true);
    const prompt = `你是中医养生专家。请针对成员[${member.name}]，性别[${member.gender}]，体质[${safeConstitutions.join('/')}]，当前节气[${rec.term.name}]，天气[${rec.weather.text}]，给出今日的身心养生建议，以精炼的信息图风格输出。`;
    const res = await askSenseNova(state, prompt);
    setAiInsight(res);
    setLoading(false);
  };

  const teas = teasByZang[rec.term.zang] || [];

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <View style={{ backgroundColor: colors.green, borderRadius: 16, padding: 16, marginBottom: 14 }}>
      <Text style={{ color: 'white', fontSize: 24, fontWeight: '800' }}>{rec.term.name} · 养{rec.term.zang}</Text>
      <Text style={{ color: '#f4f1df', marginTop: 6 }}>{state.province}{state.city} · {rec.weather.text}</Text>
      <Text style={{ color: 'white', marginTop: 8, lineHeight: 22 }}>{rec.term.focus}。{rec.term.advice}</Text>
    </View>

    <Pressable onPress={getAIInsight} disabled={loading} style={[styles.card, { backgroundColor: colors.warm, borderColor: colors.gold, paddingVertical: 12 }]}>
      <Text style={{ textAlign: 'center', color: colors.greenDark, fontWeight: '700' }}>
        {loading ? '⏳ 商汤 SenseNova 正在推演...' : '✨ 获取商汤 AI 每日养生洞察'}
      </Text>
    </Pressable>

    {aiInsight && <AIInfographic title="今日养生洞察" content={aiInsight} />}

    <View style={styles.card}>
      <Text style={styles.h2}>{constitutions[safeConstitutions[0] || '平和质']?.icon || '🌿'} {member.name}的今日养生 · {safeConstitutions.join('、')}</Text>
      <Text style={styles.sub}>{safeConstitutions.map(c => constitutions[c]?.care || '').join(' ')}</Text>
      <Text style={[styles.h2, { marginTop: 16 }]}>🍎 今日宜吃</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{rec.fit.map((food) => <Pill key={food.name} label={`${food.name}·${food.nature}`} />)}</View>
      <Text style={[styles.h2, { marginTop: 12 }]}>🚫 建议少吃</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{rec.avoid.map((food) => <Pill key={food.name} label={`${food.name}·${food.nature}`} tone="red" />)}</View>
    </View>

    <View style={styles.card}>
      <Text style={styles.h2}>🍵 今日茶饮 / 食疗</Text>
      {teas.map((tea) => <View key={tea.name} style={{ backgroundColor: '#faf7f0', padding: 12, borderRadius: 10, marginBottom: 10 }}>
        <Text style={{ color: colors.greenDark, fontWeight: '700' }}>{tea.name}</Text>
        <Text style={styles.sub}>配方：{tea.formula}</Text>
        <Text style={styles.sub}>功效：{tea.effect}</Text>
      </View>)}
    </View>

    <View style={styles.card}>
      <Text style={styles.h2}>🧘 身心关怀</Text>
      <Text style={styles.text}>{rec.term.mindAdvice || '宜静心养性，保持情绪平稳。'}</Text>
      <View style={{ marginTop: 10, backgroundColor: '#f0f7f4', padding: 10, borderRadius: 8 }}>
        <Text style={[styles.sub, { color: colors.greenDark }]}>💡 建议：{member.constitutions.includes('气郁质') ? '多散步沟通，舒缓肝气。' : '早睡早起，适度运动。'}</Text>
      </View>
    </View>

    <View style={styles.card}>
      <Text style={styles.h2}>⚠️ 天气与健康提醒</Text>
      <Text style={styles.text}>{rec.weather.tip}</Text>
      <Text style={[styles.sub, { color: colors.danger, marginTop: 8 }]}>{safetyNote(member)}</Text>
    </View>
  </ScrollView>;
}
