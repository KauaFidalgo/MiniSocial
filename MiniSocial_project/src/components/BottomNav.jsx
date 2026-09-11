import React from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CreateIcon from '../../assets/Icons/CreateIcon.png';
import HomeIcon from '../../assets/Icons/HomeIcon.png';
import NotificationIcon from '../../assets/Icons/NotificationIcon.png';
import PerfilIcon from '../../assets/Icons/PerfilIcon.png';

const baseFont = Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' });

const TABS = [
  { key: 'home', label: 'Home', icon: HomeIcon },
  { key: 'create', label: 'Criar', icon: CreateIcon },
  { key: 'notifications', label: 'Notificações', icon: NotificationIcon },
  { key: 'perfil', label: 'Perfil', icon: PerfilIcon },
];

export default function BottomNav({ active, onNavigate }) {
  return (
    <View style={styles.nav}>
      {TABS.map(({ key, label, icon }) => {
        const isActive = active === key;

        return (
          <TouchableOpacity
            key={key}
            style={styles.navItem}
            activeOpacity={0.7}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            onPress={() => onNavigate?.(key)}
          >
            <Image
              source={icon}
              style={[styles.navIcon, isActive && styles.navIconActive]}
              resizeMode="contain"
            />
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 72,
    paddingVertical: 2,
  },
  navIcon: {
    width: 22,
    height: 22,
    tintColor: '#111111',
  },
  navIconActive: {
    tintColor: '#FD7509',
  },
  navLabel: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '600',
    color: '#111111',
    fontFamily: baseFont,
  },
  navLabelActive: {
    color: '#FD7509',
  },
});
