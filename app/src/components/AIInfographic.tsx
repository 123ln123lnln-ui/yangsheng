import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from './styles';

export function AIInfographic({ title, content, type = 'general' }: { title: string, content: string, type?: string }) {
  return (
    <View style={infraStyles.container}>
      <View style={[infraStyles.header, { backgroundColor: type === 'warning' ? colors.danger : colors.greenDark }]}>
        <Text style={infraStyles.headerText}>✨ {title}</Text>
        <Text style={infraStyles.brand}>商汤 SenseNova-U1</Text>
      </View>
      <View style={infraStyles.body}>
        <Text style={infraStyles.mainText}>{content}</Text>
        <View style={infraStyles.footer}>
          <Text style={infraStyles.footerText}>—— 顺时养生 · 全家安康 ——</Text>
        </View>
      </View>
    </View>
  );
}

const infraStyles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#eee'
  },
  header: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 15
  },
  brand: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10
  },
  body: {
    padding: 16,
    backgroundColor: '#fdfcf8'
  },
  mainText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    fontStyle: 'italic'
  },
  footer: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center'
  },
  footerText: {
    fontSize: 10,
    color: colors.gold,
    letterSpacing: 2
  }
});
