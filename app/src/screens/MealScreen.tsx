import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { foods } from '../data/foods';
import { recommendationFor } from '../lib/recommend';
import type { AppState } from '../lib/storage';
import { styles, colors } from '../components/styles';
import { Pill } from '../components/Pill';

export function MealScreen({ state }: { state: AppState }) {
  const month = new Date().getMonth() + 1;
  const seasonal = foods.filter((food) => (food.months.length === 0 || food.months.includes(month)) && food.category !== '药');
  const constitutions = state.members.map((m) => m.constitution);
  const allGood = seasonal.filter((food) => !constitutions.some((c) => food.avoid.includes(c))).slice(0, 10);
  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <View style={styles.card}>
      <Text style={styles.h2}>🍲 全家共餐搭配</Text>
      <Text style={styles.sub}>综合 {state.members.map((m) => `${m.name}(${m.constitution})`).join('、')} 的体质，筛选不冲突的当季食材。</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>{allGood.map((food) => <Pill key={food.name} label={food.name} />)}</View>
    </View>

    <View style={styles.card}>
      <Text style={styles.h2}>👨‍👩‍👧 各成员差异化提示</Text>
      {state.members.map((member) => {
        const rec = recommendationFor(member);
        return <View key={member.id} style={{ borderBottomWidth: 1, borderBottomColor: colors.line, paddingVertical: 10 }}>
          <Text style={{ fontWeight: '700', color: colors.ink }}>{member.name} · {member.constitution}</Text>
          <Text style={styles.sub}>多吃：{rec.fit.slice(0, 4).map((f) => f.name).join('、') || '—'}</Text>
          <Text style={styles.sub}>少吃：{rec.avoid.slice(0, 4).map((f) => f.name).join('、') || '—'}</Text>
        </View>;
      })}
    </View>
  </ScrollView>;
}
