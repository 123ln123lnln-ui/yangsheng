import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { foods } from '../data/foods';
import { currentSolarTerm } from '../data/solarTerms';
import { styles, colors } from '../components/styles';
import { Pill } from '../components/Pill';

export function FoodScreen() {
  const month = new Date().getMonth() + 1;
  const term = currentSolarTerm();
  const seasonal = foods.filter((food) => food.months.length === 0 || food.months.includes(month));
  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <View style={styles.card}>
      <Text style={styles.h2}>🥗 {term.name}当季食材</Text>
      <Text style={styles.sub}>食材性味归经以结构化数据展示，实际使用需结合体质、忌口和医嘱。</Text>
    </View>
    {seasonal.map((food) => <View key={food.name} style={styles.card}>
      <Text style={{ fontSize: 17, color: colors.ink, fontWeight: '700' }}>{food.name} <Text style={{ color: colors.gold, fontSize: 12 }}>{food.category}</Text></Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
        <Pill label={`${food.nature}性`} tone="gold" />
        <Pill label={`${food.taste}味`} tone="gold" />
        <Pill label={`归${food.meridian}经`} tone="blue" />
      </View>
      <Text style={styles.text}>功效：{food.effect}</Text>
      <Text style={styles.sub}>适宜：{food.fit.length ? food.fit.join('、') : '各类体质'}{food.avoid.length ? `；慎食：${food.avoid.join('、')}` : ''}</Text>
    </View>)}
  </ScrollView>;
}
