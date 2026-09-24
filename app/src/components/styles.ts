import { StyleSheet } from 'react-native';

export const colors = {
  green: '#4a7c59',
  greenDark: '#3a6147',
  gold: '#c9a227',
  bg: '#f5f2ea',
  card: '#fffdf8',
  ink: '#2d2a24',
  text: '#2d2a24',
  sub: '#7a746a',
  line: '#e8e2d4',
  danger: '#c0573b',
  warm: '#f0e6d2',
};

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 14, paddingBottom: 90 },
  card: { backgroundColor: colors.card, borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: colors.line },
  h2: { color: colors.greenDark, fontWeight: '700', fontSize: 16, marginBottom: 10 },
  text: { color: colors.ink, fontSize: 14, lineHeight: 22 },
  sub: { color: colors.sub, fontSize: 12, lineHeight: 19 },
  pill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginRight: 6, marginBottom: 6 },
  pillText: { fontSize: 12 },
  button: { backgroundColor: colors.green, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '700' },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 9, backgroundColor: 'white', padding: 11, fontSize: 14, marginTop: 6, marginBottom: 10 },
});
