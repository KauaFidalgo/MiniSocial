// ========================================
// TELA: PREFERÊNCIAS
// ARQUIVO: app/preferences.jsx
// ========================================
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const interests = [
  ['Praias paradisíacas', '🏝️'],
  ['Trilhas e caminhadas', '🥾'],
  ['Aventura', '🧗'],
  ['Gastronomia local', '🍜'],
  ['Cultura e história', '🏛️'],
  ['Natureza', '🌿'],
  ['Cachoeiras', '💦'],
  ['Acampamento', '⛺'],
  ['Viagens de carro', '🚗'],
  ['Viagens internacionais', '🌎'],
  ['Cidades históricas', '🏘️'],
  ['Vida noturna', '🌙'],
  ['Ecoturismo', '🌱'],
  ['Fotografia de viagem', '📸'],
  ['Mochilão', '🎒'],
  ['Resorts e hotéis', '🏨'],
  ['Ilhas e destinos tropicais', '🌴'],
  ['Esportes e atividades', '🏄'],
];

export default function PreferencesScreen({ onNext }) {
  const [selected, setSelected] = useState(new Set());

  const toggle = (name) =>
    setSelected((current) => {
      const next = new Set(current);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>Escolha suas</Text>
            <Text style={styles.title}>preferências</Text>
          </View>

          <TouchableOpacity activeOpacity={0.8} onPress={onNext}>
            <Text style={styles.skip}>Pular</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          Encontre experiências que combinam com você!
        </Text>

        <View style={styles.chipsWrap}>
          {interests.map(([name, icon]) => {
            const active = selected.has(name);

            return (
              <TouchableOpacity
                key={name}
                activeOpacity={0.9}
                onPress={() => toggle(name)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[
                  styles.chip,
                  active && styles.activeChip,
                ]}
              >
                <Text style={styles.icon}>{icon}</Text>

                <Text
                  style={[
                    styles.chipText,
                    active && styles.activeText,
                  ]}
                >
                  {name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.nextButton}
        onPress={onNext}
        activeOpacity={0.9}
      >
        <Text style={styles.nextText}>Próximo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 90,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 8,
  },

  titleWrap: {
    flex: 1,
  },

  title: {
    color: '#101010',
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -0.8,
  },

  skip: {
    color: '#8F8F8F',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 6,
  },

  subtitle: {
    marginTop: 14,
    color: '#8B8B8B',
    fontSize: 13,
    fontWeight: '400',
  },

  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 18,
    columnGap: 10,
    rowGap: 10,
    paddingBottom: 16,
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 4,
    elevation: 1,
  },

  activeChip: {
    backgroundColor: '#FFF1E7',
    borderColor: '#FD7509',
  },

  icon: {
    fontSize: 16,
    marginRight: 8,
  },

  chipText: {
    color: '#1F1F1F',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.2,
  },

  activeText: {
    color: '#FD7509',
  },

  nextButton: {
    position: 'absolute',
    bottom: 12,
    left: 18,
    right: 18,
    minHeight: 54,
    borderRadius: 12,
    backgroundColor: '#FD7509',
    alignItems: 'center',
    justifyContent: 'center',
  },

  nextText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
