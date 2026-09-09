import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ProfileProvider } from '../context/ProfileContext';
import PreferencesScreen from './(tabs)';
import ProfileScreen from './perfil';

export default function App() {
  const [screen, setScreen] = useState('preferences');

  return (
    <ProfileProvider>
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        {screen === 'preferences' && <PreferencesScreen onNext={() => setScreen('profile')} />}
        {screen === 'profile' && <ProfileScreen onEdit={() => setScreen('edit')} onPreferences={() => setScreen('preferences')} />}
        {screen === 'edit' && <ProfileScreen mode="edit" onBack={() => setScreen('profile')} />}
        {screen === 'profile' && (
          <View style={styles.switcher}>
            <TouchableOpacity onPress={() => setScreen('preferences')}><Text style={styles.switchText}>Preferências</Text></TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </ProfileProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  switcher: { position: 'absolute', top: 14, right: 14 },
  switchText: { color: '#8D8C8C', fontSize: 12 },
});

export { ProfileScreen };

