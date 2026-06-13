import React, { useEffect, useState } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, StatusBar, Text, View } from 'react-native';
import { HomeScreen } from './src/screens/HomeScreen';
import { DietScreen } from './src/screens/DietScreen';
import { EatScreen } from './src/screens/EatScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { type AppState, defaultState, loadState, saveState } from './src/lib/storage';
import { currentSolarTerm } from './src/data/solarTerms';
import { colors } from './src/components/styles';

type Tab = 'home' | 'diet' | 'eat' | 'settings';

const tabs: { key: Tab; icon: string; label: string }[] = [
  { key: 'home', icon: '🏠', label: '今日' },
  { key: 'diet', icon: '🍲', label: '食养' },
  { key: 'eat', icon: '🍽️', label: '想吃' },
  { key: 'settings', icon: '⚙️', label: '管理' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('home');
  const [state, setState] = useState<AppState>(defaultState);
  useEffect(() => { loadState().then(setState); }, []);
  const updateState = (next: AppState) => {
    setState(next);
    void saveState(next);
  };
  const term = currentSolarTerm();
  return <SafeAreaProvider>
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.greenDark} />
      <View style={{ backgroundColor: colors.greenDark, padding: 16 }}>
        <Text style={{ color: 'white', fontSize: 20, fontWeight: '800' }}>和 家和养生</Text>
        <Text style={{ color: '#f5f2ea', marginTop: 4 }}>📍 {state.province}·{state.city} · {term.name} · 顺时养生，全家安康</Text>
      </View>
      <View style={{ flex: 1 }}>
        {tab === 'home' ? <HomeScreen state={state} /> : null}
        {tab === 'diet' ? <DietScreen state={state} /> : null}
        {tab === 'eat' ? <EatScreen state={state} onChange={updateState} /> : null}
        {tab === 'settings' ? <SettingsScreen state={state} onChange={updateState} /> : null}
      </View>
      <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: 'white' }}>
        {tabs.map((item) => {
          const active = tab === item.key;
          return <Pressable key={item.key} onPress={() => setTab(item.key)} style={{ flex: 1, alignItems: 'center', paddingVertical: 9 }}>
            <Text style={{ fontSize: 20 }}>{item.icon}</Text>
            <Text style={{ color: active ? colors.green : colors.sub, fontSize: 11, fontWeight: active ? '700' : '400' }}>{item.label}</Text>
          </Pressable>;
        })}
      </View>
    </SafeAreaView>
  </SafeAreaProvider>;
}

