import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useProfile } from '../context/ProfileContext';

const posts = [
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&q=80',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&q=80',
  'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=80',
];

export default function ProfileScreen({ mode = 'view', onEdit, onBack }) {
  const { profile, updateProfile } = useProfile();
  if (mode === 'edit') return <EditProfile profile={profile} updateProfile={updateProfile} onBack={onBack} />;
  return <View style={styles.screen}>
    <View style={styles.topbar}><Text style={styles.logo}>▮ Triply</Text><Text style={styles.settings}>⚙</Text></View>
    <Text style={styles.profileTitle}>Perfil</Text>
    <View style={styles.avatar} />
    <Text style={styles.name}>{profile.name}</Text><Text style={styles.username}>@{profile.username}</Text>
    <View style={styles.stats}>{[['12', 'publicações'], ['150', 'seguidores'], ['80', 'seguindo']].map(([value, label]) => <View style={styles.stat} key={label}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>)}</View>
    <Text style={styles.bio}>{profile.bio}</Text>
    <TouchableOpacity style={styles.editButton} onPress={onEdit}><Text style={styles.editText}>Editar perfil</Text></TouchableOpacity>
    <View style={styles.tabs}><Text style={styles.activeTab}>▦</Text><Text style={styles.tab}>♡</Text></View>
    <ScrollView contentContainerStyle={styles.grid}>{posts.map((uri) => <Image key={uri} source={{ uri }} style={styles.post} />)}</ScrollView>
    <View style={styles.nav}>{[['⌂', 'Home'], ['⊞', 'Criar'], ['♧', 'Notificações'], ['◉', 'Perfil']].map(([icon, label], index) => <TouchableOpacity key={label} style={styles.navItem}><Text style={[styles.navIcon, index === 3 && styles.selectedNav]}>{icon}</Text><Text style={[styles.navLabel, index === 3 && styles.selectedNav]}>{label}</Text></TouchableOpacity>)}</View>
  </View>;
}

function EditProfile({ profile, updateProfile, onBack }) {
  const [name, setName] = useState(profile.name); const [username, setUsername] = useState(profile.username); const [bio, setBio] = useState(profile.bio);
  const save = () => { updateProfile({ name, username, bio }); onBack?.(); };
  return <ScrollView style={styles.screen} contentContainerStyle={styles.editScreen} keyboardShouldPersistTaps="handled">
    <View style={styles.editHeader}><TouchableOpacity onPress={onBack}><Text style={styles.back}>‹</Text></TouchableOpacity><Text style={styles.editTitle}>Editar Perfil</Text><View /></View>
    <View style={styles.avatarWrap}><View style={styles.avatar} /><View style={styles.dot} /></View>
    <Text style={styles.fieldLabel}>Nome</Text><TextInput style={styles.input} value={name} onChangeText={setName} />
    <Text style={styles.fieldLabel}>Usuário</Text><TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" />
    <Text style={styles.fieldLabel}>Bio</Text><TextInput style={styles.bioInput} value={bio} onChangeText={setBio} multiline textAlignVertical="top" />
    <TouchableOpacity style={styles.save} onPress={save}><Text style={styles.saveText}>Salvar Alterações</Text></TouchableOpacity>
  </ScrollView>;
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#FFF' }, topbar: { height: 30, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, alignItems: 'center' }, logo: { color: '#FD7509', fontSize: 17, fontWeight: '700' }, settings: { fontSize: 18 }, profileTitle: { textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#111' }, avatar: { width: 72, height: 72, borderRadius: 40, backgroundColor: '#000', alignSelf: 'center', marginTop: 4 }, name: { textAlign: 'center', fontSize: 15, fontWeight: '700', marginTop: 4 }, username: { textAlign: 'center', color: '#8D8C8C', fontSize: 11 }, stats: { flexDirection: 'row', justifyContent: 'center', marginTop: 14 }, stat: { width: 80, alignItems: 'center', borderRightWidth: 1, borderRightColor: '#ECECEC' }, statValue: { fontWeight: '700', fontSize: 14 }, statLabel: { color: '#8D8C8C', fontSize: 10 }, bio: { textAlign: 'center', fontWeight: '600', fontSize: 11, margin: 18, lineHeight: 15 }, editButton: { alignSelf: 'center', borderWidth: 1, borderColor: '#FD7509', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 5 }, editText: { color: '#FD7509', fontSize: 11, fontWeight: '600' }, tabs: { borderBottomWidth: 1, borderBottomColor: '#ECECEC', borderTopWidth: 1, borderTopColor: '#ECECEC', marginTop: 10, height: 38, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }, activeTab: { color: '#FD7509', fontSize: 24 }, tab: { fontSize: 23 }, grid: { flexDirection: 'row', gap: 3, padding: 6 }, post: { width: '32.7%', height: 80, borderRadius: 3 }, nav: { height: 52, borderTopWidth: 1, borderTopColor: '#DDD', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }, navItem: { alignItems: 'center' }, navIcon: { fontSize: 20, color: '#202020' }, navLabel: { fontSize: 10, color: '#202020' }, selectedNav: { color: '#FD7509' }, editScreen: { paddingHorizontal: 11, paddingBottom: 20 }, editHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 }, back: { fontSize: 28, color: '#FD7509' }, editTitle: { color: '#FD7509', fontSize: 16, fontWeight: '700' }, avatarWrap: { alignSelf: 'center', marginVertical: 18 }, dot: { width: 16, height: 16, backgroundColor: '#FD7509', borderRadius: 10, position: 'absolute', right: -1, bottom: 7 }, fieldLabel: { fontSize: 14, fontWeight: '700', marginBottom: 3, color: '#202020' }, input: { height: 30, borderWidth: 1, borderColor: '#A0A0A0', borderRadius: 4, paddingHorizontal: 10, fontSize: 11, marginBottom: 15 }, bioInput: { height: 109, borderWidth: 1, borderColor: '#A0A0A0', borderRadius: 4, padding: 12, fontSize: 13, lineHeight: 18, marginBottom: 25 }, save: { height: 32, borderRadius: 5, backgroundColor: '#FD7509', alignItems: 'center', justifyContent: 'center' }, saveText: { color: '#FFF', fontSize: 13 },
});
