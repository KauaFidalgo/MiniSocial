import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import BottomNav from '../components/BottomNav';

const baseFont = Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' });

export default function CreateScreen({ onNavigate }) {
  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>Criar publicação</Text>
        <Text style={styles.subtitle}>
          Em breve você vai poder compartilhar novas viagens por aqui.
        </Text>
      </View>
      <BottomNav active="create" onNavigate={onNavigate} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'space-between' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  title: { fontSize: 20, fontWeight: '800', color: '#111111', fontFamily: baseFont, marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#7A7A7A', fontFamily: baseFont, textAlign: 'center', lineHeight: 20 },
});
