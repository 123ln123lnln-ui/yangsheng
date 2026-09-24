import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, Alert, Modal } from 'react-native';
import type { AppState, Member } from '../lib/storage';
import { styles, colors } from '../components/styles';
import { constitutions } from '../data/constitutions';

const ALL_HEALTH_TAGS = [
  '孕期', '糖尿病', '高血压', '痛风', '久坐', '熬夜', '压力大', '花粉过敏',
  '手脚冰凉', '容易疲劳', '掉发严重', '失眠多梦', '便秘', '胃寒', '心烦易怒', '眼睛干涩'
];

export function SettingsScreen({ state, onChange }: { state: AppState; onChange: (s: AppState) => void }) {
  const [editingMember, setEditingMember] = useState<Partial<Member> | null>(null);
  const [showConsInfo, setShowConsInfo] = useState<string | null>(null);

  const saveMember = () => {
    if (!editingMember?.name) return Alert.alert('提示', '请输入姓名');
    let nextMembers = [...state.members];
    if (editingMember.id) {
      nextMembers = nextMembers.map(m => m.id === editingMember.id ? { ...m, ...editingMember } as Member : m);
    } else {
      nextMembers.push({
        ...editingMember,
        id: Date.now().toString(),
        gender: editingMember.gender || '男',
        age: editingMember.age || 30,
        constitutions: editingMember.constitutions || ['平和质'],
        healthTags: editingMember.healthTags || [],
        avoidList: editingMember.avoidList || []
      } as Member);
    }
    onChange({ ...state, members: nextMembers });
    setEditingMember(null);
  };

  const toggleField = (id: string, field: 'constitutions' | 'healthTags', val: string) => {
    const next = state.members.map(m => {
      if (m.id !== id) return m;
      const list = (m[field] as string[]).includes(val) 
        ? (m[field] as string[]).filter(v => v !== val)
        : [...(m[field] as string[]), val];
      return { ...m, [field]: list };
    });
    onChange({ ...state, members: next });
  };

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
      <Text style={styles.h2}>👨‍👩‍👧 家庭成员</Text>
      <Pressable onPress={() => setEditingMember({ name: '', age: 30, constitutions: ['平和质'] })} style={[styles.button, { paddingVertical: 6, paddingHorizontal: 12 }]}>
        <Text style={{ color: 'white', fontSize: 13 }}>+ 添加成员</Text>
      </Pressable>
    </View>

    {state.members.map(m => (
      <View key={m.id} style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.greenDark }}>{m.name} <Text style={{ fontSize: 13, fontWeight: '400', color: colors.sub }}>{m.gender} · {m.age}岁</Text></Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Pressable onPress={() => setEditingMember(m)} style={{ marginRight: 15 }}><Text style={{ color: colors.green }}>修改</Text></Pressable>
            <Pressable onPress={() => Alert.alert('确认', '删除此成员？', [{ text: '取消' }, { text: '删除', onPress: () => onChange({ ...state, members: state.members.filter(x => x.id !== m.id) }) }])}><Text style={{ color: colors.danger }}>删除</Text></Pressable>
          </View>
        </View>

        <Text style={[styles.sub, { marginTop: 12 }]}>体质 (点击标签查看详情)</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
          {Object.keys(constitutions).map(c => (
            <Pressable key={c} 
              onPress={() => toggleField(m.id, 'constitutions', c)} 
              onLongPress={() => setShowConsInfo(c)}
              style={{
                paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, marginRight: 6, marginBottom: 6,
                backgroundColor: m.constitutions.includes(c as any) ? colors.green : '#f0f0f0'
              }}>
              <Text style={{ fontSize: 12, color: m.constitutions.includes(c as any) ? 'white' : '#666' }}>{c}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sub, { marginTop: 8 }]}>常见症状/标签</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
          {ALL_HEALTH_TAGS.map(t => (
            <Pressable key={t} onPress={() => toggleField(m.id, 'healthTags', t)} style={{
              paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, marginRight: 6, marginBottom: 6,
              backgroundColor: m.healthTags.includes(t) ? colors.greenDark : '#f0f0f0'
            }}>
              <Text style={{ fontSize: 12, color: m.healthTags.includes(t) ? 'white' : '#666' }}>{t}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    ))}

    <Text style={styles.h2}>📍 养生地域</Text>
    <View style={[styles.card, { flexDirection: 'row', alignItems: 'center' }]}>
      <TextInput style={[styles.input, { flex: 1, marginTop: 0, marginBottom: 0 }]} value={state.province} onChangeText={t => onChange({ ...state, province: t })} placeholder="省份" />
      <Text style={{ marginHorizontal: 10 }}>-</Text>
      <TextInput style={[styles.input, { flex: 1, marginTop: 0, marginBottom: 0 }]} value={state.city} onChangeText={t => onChange({ ...state, city: t })} placeholder="城市" />
    </View>

    <Text style={styles.h2}>⚙️ 大模型配置</Text>
    <View style={styles.card}>
      <Text style={styles.sub}>模型名称</Text>
      <TextInput style={styles.input} value={state.model.model} onChangeText={t => onChange({ ...state, model: { ...state.model, model: t } })} />
      <Text style={styles.sub}>API Key</Text>
      <TextInput style={styles.input} secureTextEntry value={state.model.apiKey} onChangeText={(t) => onChange({ ...state, model: { ...state.model, apiKey: t } })} placeholder="请输入 API Key" />
    </View>

    <Modal visible={!!editingMember} animationType="slide" transparent>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View style={{ backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 }}>
          <Text style={styles.h2}>{editingMember?.id ? '修改成员' : '添加成员'}</Text>
          <TextInput style={styles.input} placeholder="姓名 (如: 爸爸)" value={editingMember?.name} onChangeText={t => setEditingMember(prev => ({ ...prev!, name: t }))} />
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            <Pressable onPress={() => setEditingMember(prev => ({ ...prev!, gender: '男' }))} style={{ flex: 1, padding: 10, backgroundColor: editingMember?.gender === '男' ? colors.green : '#f0f0f0', borderRadius: 8, alignItems: 'center' }}><Text>男</Text></Pressable>
            <View style={{ width: 10 }} />
            <Pressable onPress={() => setEditingMember(prev => ({ ...prev!, gender: '女' }))} style={{ flex: 1, padding: 10, backgroundColor: editingMember?.gender === '女' ? colors.green : '#f0f0f0', borderRadius: 8, alignItems: 'center' }}><Text>女</Text></Pressable>
          </View>
          <TextInput style={[styles.input, { marginTop: 15 }]} keyboardType="numeric" placeholder="年龄" value={editingMember?.age?.toString()} onChangeText={t => setEditingMember(prev => ({ ...prev!, age: parseInt(t) || 0 }))} />
          <View style={{ flexDirection: 'row', marginTop: 20 }}>
            <Pressable onPress={() => setEditingMember(null)} style={{ flex: 1, padding: 12, alignItems: 'center' }}><Text>取消</Text></Pressable>
            <Pressable onPress={saveMember} style={{ flex: 2, backgroundColor: colors.green, padding: 12, borderRadius: 8, alignItems: 'center' }}><Text style={{ color: 'white', fontWeight: '700' }}>保存</Text></Pressable>
          </View>
        </View>
      </View>
    </Modal>

    <Modal visible={!!showConsInfo} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 30 }}>
        <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 20 }}>
          <Text style={styles.h2}>{showConsInfo} 特征与建议</Text>
          <Text style={styles.text}>{showConsInfo && (constitutions as any)[showConsInfo]?.desc}</Text>
          <Text style={[styles.sub, { marginTop: 15 }]}>✅ 调理建议：</Text>
          <Text style={styles.text}>{showConsInfo && (constitutions as any)[showConsInfo]?.care}</Text>
          <Pressable onPress={() => setShowConsInfo(null)} style={{ marginTop: 20, backgroundColor: colors.green, padding: 12, borderRadius: 8, alignItems: 'center' }}>
            <Text style={{ color: 'white' }}>知道了</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  </ScrollView>;
}
