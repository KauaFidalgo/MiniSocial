import React from 'react';
import { SymbolView } from 'expo-symbols';

const ICONS = {
  home: { ios: 'house', android: 'home', web: 'home' },
  create: { ios: 'plus.square', android: 'add_box', web: 'add_box' },
  bell: { ios: 'bell', android: 'notifications', web: 'notifications' },
  person: { ios: 'person.circle', android: 'account_circle', web: 'account_circle' },
  gear: { ios: 'gearshape', android: 'settings', web: 'settings' },
  chevronLeft: { ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' },
  grid: { ios: 'square.grid.2x2', android: 'grid_view', web: 'grid_view' },
  bookmark: { ios: 'bookmark', android: 'bookmark', web: 'bookmark' },
  ticket: { ios: 'ticket', android: 'confirmation_number', web: 'confirmation_number' },
};

export default function AppIcon({ name, size = 24, color = '#202020', style, weight }) {
  const symbolName = ICONS[name];

  if (!symbolName) {
    return null;
  }

  return (
    <SymbolView
      name={symbolName}
      size={size}
      tintColor={color}
      weight={weight}
      style={[{ width: size, height: size }, style]}
      fallback={null}
    />
  );
}