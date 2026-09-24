import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable } from 'react-native';
import { constitutionList, healthTags, avoidTags } from '../data/constitutions';
import type { AppState, Member } from '../lib/storage';
import { colors, styles } from '../components/styles';

export function FamilyScreen({ state, onChange }: { state: AppState; onChange: (s: AppState) => void }) {
  const [draft, setDraft] = useState<Member>({ id: '', name: '', gender: '女', age: 30, constitution: '平和质', healthTags: [], avoidList: [] });
  const addMember = () => {
    const member = { ...draft, id: `m${Date.now()}`, name: draft.name || '家人' };
    onChange({ ...state, currentMemberId: member.id, members: [...state.members, member] });
    setDraft({ id: '', name: '', gender: '女', age: 30, constitution: '平和质', healthTags: [], avoidList: [] });
  };
  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <View style={styles.card}>
      <Text style={styles.h2}>🏡 {state.family}</Text>
      <Text style={styles.sub}>所在地区</Text>
      <TextInput style={styles.input} value={state.province} onChangeText={(province) => onChange({ ...state, province })} />
      <TextInput style={styles.input} value={state.city} onChangeText={(city) => onChange({ ...state, city })} />
    </View>

    <View style={styles.card}>
      <Text style={styles.h2}>👨‍👩‍👧 家庭成员</Text>
      {state.members.map((member) => <Pressable key={member.id} onPress={() => onChange({ ...state, currentMemberId: member.id })} style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.line }}>
        <Text style={{ color: colors.ink, fontWeight: '700' }}>{member.name} · {member.constitution}</Text>
        <Text style={styles.sub}>{member.gender} · {member.age}岁 {member.healthTags.length ? `· ${member.healthTags.join('/')}` : ''}</Text>
      </Pressable>)}
    </View>

    <View style={styles.card}>
      <Text style={styles.h2}>＋ 添加成员</Text>
      <TextInput style={styles.input} placeholder="称呼，如：爸爸、奶奶、小宝" value={draft.name} onChangeText={(name) => setDraft({ ...draft, name })} />
      <TextInput style={styles.input} keyboardType="number-pad" placeholder="年龄" value={String(draft.age)} onChangeText={(age) => setDraft({ ...draft, age: Number(age) || 0 })} />
      <Text style={styles.sub}>体质类型</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>{constitutionList.map((c) => <Pressable key={c} onPress={() => setDraft({ ...draft, constitution: c })} style={[styles.pill, { backgroundColor: draft.constitution === c ? '#e4efe7' : '#fff' }]}><Text style={{ color: draft.constitution === c ? colors.greenDark : colors.sub }}>{c}</Text></Pressable>)}</View>
      <Text style={styles.sub}>健康标签</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>{healthTags.map((tag) => {
        const on = draft.healthTags.includes(tag);
        return <Pressable key={tag} onPress={() => setDraft({ ...draft, healthTags: on ? draft.healthTags.filter((x) => x !== tag) : [...draft.healthTags, tag] })} style={[styles.pill, { backgroundColor: on ? '#e4efe7' : '#fff' }]}><Text>{tag}</Text></Pressable>;
      })}</View>
      <Text style={styles.sub}>忌口 / 过敏</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>{avoidTags.map((tag) => {
        const on = draft.avoidList.includes(tag);
        return <Pressable key={tag} onPress={() => setDraft({ ...draft, avoidList: on ? draft.avoidList.filter((x) => x !== tag) : [...draft.avoidList, tag] })} style={[styles.pill, { backgroundColor: on ? '#f6e0d9' : '#fff' }]}><Text>{tag}</Text></Pressable>;
      })}</View>
      <Pressable style={[styles.button, { marginTop: 14 }]} onPress={addMember}><Text style={styles.buttonText}>保存成员</Text></Pressable>
    </View>
  </ScrollView>;
}
