import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { foods, type Food } from '../data/foods';
import { styles, colors } from '../components/styles';
import { Pill } from '../components/Pill';
import { AIInfographic } from '../components/AIInfographic';
import { askSenseNova } from '../lib/ai';
import type { AppState } from '../lib/storage';

export function DietScreen({ state }: { state: AppState }) {
  const [category, setCategory] = useState<string>('全部');
  const [aiRecipe, setAiRecipe] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getAIRecipe = async () => {
    setLoading(true);
    const memberCons = state.members.map(m => `${m.name}(${m.constitutions.join('/')})`).join('、');
    const prompt = `全家成员体质如下：${memberCons}。请根据当前时令推荐一道今日共餐菜品，并给出每位成员的差异化食用建议，以信息图风格输出。`;
    const res = await askSenseNova(state, prompt);
    setAiRecipe(res);
    setLoading(false);
  };

  const categories = ['全部', '蔬', '果', '谷', '肉', '干', '茶', '油'];
  const familySafeCount = state.members ? state.members.length : 0;
  const filteredFoods = category === '全部' ? foods : foods.filter(f => f.category === category);

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <Pressable onPress={getAIRecipe} disabled={loading} style={[styles.card, { backgroundColor: '#e9f5f0', borderColor: colors.green }]}>
      <Text style={{ textAlign: 'center', color: colors.greenDark, fontWeight: '700' }}>
        {loading ? '⏳ 商汤 AI 正在配置食谱...' : '🥘 获取商汤 AI 顺时定制食谱'}
      </Text>
    </Pressable>

    {aiRecipe && <AIInfographic title="今日顺时食谱" content={aiRecipe} />}
    <View style={styles.card}>
      <Text style={styles.h2}>🍲 共餐建议</Text>
      <Text style={styles.sub}>根据全家 {familySafeCount} 位成员体质筛选：</Text>
      <View style={{ marginTop: 10, padding: 12, backgroundColor: '#fdfaf2', borderRadius: 8 }}>
        <Text style={{ fontWeight: '700', color: colors.greenDark }}>💡 今日共餐：山药排骨汤</Text>
        <Text style={styles.sub}>改良逻辑：山药补脾，排骨滋阴，适合全家多数体质。</Text>
      </View>
    </View>

    <View style={{ flexDirection: 'row', paddingHorizontal: 4, marginBottom: 12 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map(c => (
          <Pressable key={c} onPress={() => setCategory(c)} style={{
            paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
            backgroundColor: category === c ? colors.green : 'white', marginRight: 8,
            borderWidth: 1, borderColor: colors.line
          }}>
            <Text style={{ color: category === c ? 'white' : colors.text }}>{c}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>

    <View style={styles.card}>
      <Text style={styles.h2}>🧺 食材库</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {filteredFoods.map(food => (
          <View key={food.name} style={{ width: '100%', borderBottomWidth: 1, borderBottomColor: colors.line, paddingVertical: 10 }}>
            <Text style={{ fontSize: 16, fontWeight: '600' }}>{food.name} <Text style={{ fontSize: 12, fontWeight: '400', color: colors.sub }}>[{food.nature} / {food.taste}]</Text></Text>
            <Text style={[styles.sub, { marginTop: 4 }]}>✨ 功效：{food.effect}</Text>
            {food.processTip && <Text style={[styles.sub, { color: colors.green, marginTop: 2 }]}>🍳 加工：{food.processTip}</Text>}
          </View>
        ))}
      </View>
    </View>
  </ScrollView>;
}
