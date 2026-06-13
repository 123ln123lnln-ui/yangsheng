import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { styles, colors } from '../components/styles';
import { AIInfographic } from '../components/AIInfographic';
import type { AppState, EatRecord } from '../lib/storage';

export function EatScreen({ state, onChange }: { state: AppState, onChange: (s: AppState) => void }) {
  const [input, setInput] = useState('');

  const pickImage = async (useCamera: boolean) => {
    const permission = useCamera 
      ? await ImagePicker.requestCameraPermissionsAsync() 
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permission.granted) return Alert.alert('权限', '需要授权才能使用摄像头或相册');

    const result = useCamera 
      ? await ImagePicker.launchCameraAsync({ quality: 0.5 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.5 });

    if (!result.canceled) {
      const newRecord: EatRecord = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        content: result.assets[0].uri,
        type: 'image',
        feedback: '图中食材属于温热平衡，SenseNova 建议：搭配少量绿茶可清火。'
      };
      onChange({ ...state, eatRecords: [newRecord, ...state.eatRecords] });
    }
  };

  const addTextRecord = () => {
    if (!input.trim()) return;
    const newRecord: EatRecord = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      content: input,
      type: 'text',
      feedback: '商汤 SenseNova 诊断：此食物属性偏温，您的体质宜少量食用。'
    };
    onChange({ ...state, eatRecords: [newRecord, ...state.eatRecords] });
    setInput('');
  };

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <View style={styles.card}>
      <Text style={styles.h2}>🍽️ 今天想吃点什么？</Text>
      <TextInput
        style={{ backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, marginTop: 12, height: 80, textAlignVertical: 'top' }}
        placeholder="例如：今天想吃火锅..."
        multiline
        value={input}
        onChangeText={setInput}
      />
      <View style={{ flexDirection: 'row', marginTop: 12 }}>
        <Pressable onPress={addTextRecord} style={{ backgroundColor: colors.green, flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' }}>
          <Text style={{ color: 'white', fontWeight: '700' }}>提交 AI 分析</Text>
        </Pressable>
        <Pressable onPress={() => pickImage(true)} style={{ backgroundColor: '#eee', width: 50, marginLeft: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 20 }}>📷</Text>
        </Pressable>
        <Pressable onPress={() => pickImage(false)} style={{ backgroundColor: '#eee', width: 50, marginLeft: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 20 }}>🖼️</Text>
        </Pressable>
      </View>
    </View>

    <Text style={[styles.h2, { marginLeft: 4, marginBottom: 10 }]}>📝 饮食记录 (AI 信息图)</Text>
    {state.eatRecords.map(record => (
      <View key={record.id} style={[styles.card, { padding: 10 }]}>
        {record.type === 'image' ? (
          <Image source={{ uri: record.content }} style={{ width: '100%', height: 180, borderRadius: 8, marginBottom: 8 }} />
        ) : (
          <Text style={{ fontWeight: '600', marginBottom: 8 }}>“{record.content}”</Text>
        )}
        <Text style={[styles.sub, { fontSize: 10, marginBottom: 5 }]}>{new Date(record.timestamp).toLocaleString()}</Text>
        <AIInfographic title="饮食养生洞察" content={record.feedback || ''} />
      </View>
    ))}
  </ScrollView>;
}
