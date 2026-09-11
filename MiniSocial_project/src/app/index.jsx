import React, { useEffect, useState } from 'react';
import { Animated, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { ProfileProvider } from '../context/ProfileContext';
import PreferencesScreen from './preferences';
import ProfileScreen from '../screens/ProfileScreen';
import HomeScreen from '../screens/HomeScreen';
import CreateScreen from '../screens/CreateScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

function ScreenTransition({ children }) {
  const [opacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(10));

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

// Footer destinations share one navigation handler so every screen's
// BottomNav (Home / Criar / Notificações / Perfil) drives the same
// screen state machine used by the rest of the app.
const FOOTER_SCREENS = {
  home: 'home',
  create: 'create',
  notifications: 'notifications',
  perfil: 'profile',
};

export default function App() {
  const [screen, setScreen] = useState('preferences');

  const handleNavigate = (key) => {
    const target = FOOTER_SCREENS[key];
    if (target) {
      setScreen(target);
    }
  };

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

          {screen === 'home' && (
            <ScreenTransition>
              <HomeScreen onNavigate={handleNavigate} />
            </ScreenTransition>
          )}

          {screen === 'create' && (
            <ScreenTransition>
              <CreateScreen onNavigate={handleNavigate} />
            </ScreenTransition>
          )}

          {screen === 'notifications' && (
            <ScreenTransition>
              <NotificationsScreen onNavigate={handleNavigate} />
            </ScreenTransition>
          )}

          {screen === 'profile' && (
            <ScreenTransition>
              <ProfileScreen onEdit={() => setScreen('edit')} onNavigate={handleNavigate} />
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
