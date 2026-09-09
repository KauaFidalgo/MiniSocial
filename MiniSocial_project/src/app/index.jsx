import React, { useEffect, useRef, useState } from 'react';
import { Animated, SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProfileProvider } from '../context/ProfileContext';
import PreferencesScreen from './preferences';
import ProfileScreen from '../screens/ProfileScreen';

function ScreenTransition({ children }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <Animated.View
      style={[
        styles.transition,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export default function App() {
  const [screen, setScreen] = useState('preferences');

  return (
    <SafeAreaProvider>
      <ProfileProvider>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

          {screen === 'preferences' && (
            <ScreenTransition>
              <PreferencesScreen onNext={() => setScreen('profile')} />
            </ScreenTransition>
          )}

          {screen === 'profile' && (
            <ScreenTransition>
              <ProfileScreen onEdit={() => setScreen('edit')} />
            </ScreenTransition>
          )}

          {screen === 'edit' && (
            <ScreenTransition>
              <ProfileScreen mode="edit" onBack={() => setScreen('profile')} />
            </ScreenTransition>
          )}
        </SafeAreaView>
      </ProfileProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  transition: {
    flex: 1,
  },
});
