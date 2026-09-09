import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const interests = [
  ['Comedy', '🤣'], ['Daily Life', '◷'], ['Animals', '🐱'], ['Food', '🍔'],
  ['Gaming', '🎮'], ['Travel', '🏖️'], ['DIY', '✂️'], ['Sports', '🏀'],
  ['Beauty & Style', '💄'], ['Fashion Accessories', '🧢'], ['Art', '🎨'],
  ['Tech', '💻'], ['Auto', '🏍️'], ['Dance', '💃'], ['Oddly Satisfying', '😵'],
];

export default function PreferencesScreen({ onNext }) {
  const [selected, setSelected] = useState(new Set());
  const toggle = (name) => setSelected((current) => {
    const next = new Set(current);
    next.has(name) ? next.delete(name) : next.add(name);
    return next;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View><Text style={styles.title}>Escolha suas</Text><Text style={styles.title}>preferências</Text></View>
        <TouchableOpacity><Text style={styles.skip}>Skip</Text></TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>Tenha recomendações personalizadas !</Text>
      <ScrollView contentContainerStyle={styles.chips} showsVerticalScrollIndicator={false}>
        {interests.map(([name, icon]) => {
          const active = selected.has(name);
          return <TouchableOpacity key={name} style={[styles.chip, active && styles.activeChip]} onPress={() => toggle(name)} accessibilityRole="button" accessibilityState={{ selected: active }}>
            <Text style={styles.icon}>{icon}</Text><Text style={[styles.chipText, active && styles.activeText]}>{name}</Text>
          </TouchableOpacity>;
        })}
      </ScrollView>
      <TouchableOpacity style={styles.next} onPress={onNext}><Text style={styles.nextText}>Próximo</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 10, paddingTop: 24, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingRight: 8 },
  title: { color: '#101010', fontSize: 26, lineHeight: 32, fontWeight: '800' },
  skip: { color: '#8D8C8C', fontSize: 12, paddingTop: 3 },
  subtitle: { color: '#8D8C8C', fontSize: 12, marginTop: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingTop: 24, paddingBottom: 18 },
  chip: { height: 34, paddingHorizontal: 12, borderRadius: 18, borderWidth: 1, borderColor: '#ECECEC', shadowColor: '#999', shadowOpacity: 0.08, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF' },
  activeChip: { backgroundColor: '#FFEEE0', borderColor: '#FD7509' },
  icon: { fontSize: 17, marginRight: 7 },
  chipText: { color: '#202020', fontSize: 11, fontWeight: '600' },
  activeText: { color: '#FD7509' },
  next: { height: 32, borderRadius: 5, backgroundColor: '#FD7509', alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  nextText: { color: '#FFF', fontSize: 13 },
});
