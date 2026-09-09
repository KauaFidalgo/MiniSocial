import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../constants/theme';

export default function Avatar({ size = 96, badge = true }) {
  const badgeSize = Math.max(14, Math.round(size * 0.22));

  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.circle,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      />
      {badge ? (
        <View
          style={[
            styles.badge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              right: badgeSize * 0.05,
              bottom: badgeSize * 0.05,
              borderWidth: Math.max(2, size * 0.025),
            },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: colors.avatarPlaceholder,
  },
  badge: {
    position: 'absolute',
    backgroundColor: colors.primary,
    borderColor: colors.white,
  },
});