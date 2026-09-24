import React from 'react';
import { View, Text } from 'react-native';
import { colors, styles } from './styles';

export function Pill({ label, tone = 'green' }: { label: string; tone?: 'green' | 'gold' | 'red' | 'blue' }) {
  const bg = tone === 'green' ? '#e4efe7' : tone === 'gold' ? '#f7eecb' : tone === 'red' ? '#f6e0d9' : '#dde8ef';
  const fg = tone === 'red' ? colors.danger : tone === 'gold' ? '#8a6d00' : tone === 'blue' ? '#36617a' : colors.greenDark;
  return <View style={[styles.pill, { backgroundColor: bg }]}><Text style={[styles.pillText, { color: fg }]}>{label}</Text></View>;
}
