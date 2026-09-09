import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
  Platform,
} from 'react-native';

const baseFont = Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' });
import BackIcon from '../../assets/Icons/BackIcon.png';
import CreateIcon from '../../assets/Icons/CreateIcon.png';
import FavIcon from '../../assets/Icons/FavIcon.png';
import GroupIcon from '../../assets/Icons/GroupIcon.png';
import HomeIcon from '../../assets/Icons/HomeIcon.png';
import LogoMiniSocial from '../../assets/Icons/LogoMiniSocial.png';
import NotificationIcon from '../../assets/Icons/NotificationIcon.png';
import PenIcon from '../../assets/Icons/PenIcon.png';
import PerfilIcon from '../../assets/Icons/PerfilIcon.png';
import SenttingsIcon from '../../assets/Icons/SenttingsIcon.png';
import { useProfile } from '../context/ProfileContext';

export default function ProfileScreen({ mode = 'view', onEdit, onBack }) {
  const { profile, posts, users, loading, error, toggleFavorite, toggleFollow, updateProfile } = useProfile();
  const [activeTab, setActiveTab] = useState('posts');
  const [peopleListMode, setPeopleListMode] = useState(null);
  const modalAnim = useRef(new Animated.Value(0)).current;
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    if (peopleListMode) {
      Animated.timing(modalAnim, { toValue: 1, duration: 260, useNativeDriver: true }).start();
    }
  }, [peopleListMode, modalAnim]);

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#FD7509" />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.loadingWrap}>
        <Text style={styles.errorText}>{error || 'Não foi possível carregar o perfil.'}</Text>
      </View>
    );
  }

  if (mode === 'edit') {
    return <EditProfile profile={profile} updateProfile={updateProfile} onBack={onBack} />;
  }

  const visiblePosts = useMemo(() => {
    if (activeTab === 'favorites') {
      return posts.filter((post) => profile.favoritePosts.includes(post.id));
    }

    return posts.filter((post) => post.userId === profile.id);
  }, [activeTab, posts, profile]);

  // responsive grid calculation
  const horizontalPadding = 24; // grid padding total (left+right)
  const gap = 8;
  const columns = width >= 1000 ? 4 : width >= 700 ? 3 : width >= 420 ? 2 : 1;
  const itemWidth = Math.floor((width - horizontalPadding - gap * (columns - 1)) / columns);

  const followerUsers = useMemo(
    () => (profile.followers ?? []).map((id) => users.find((user) => user.id === id)).filter(Boolean),
    [profile.followers, users]
  );

  const followingUsers = useMemo(
    () => (profile.following ?? []).map((id) => users.find((user) => user.id === id)).filter(Boolean),
    [profile.following, users]
  );

  const peopleList = peopleListMode === 'followers' ? followerUsers : followingUsers;

  const getFollowStatus = (person) => {
    const isFollowing = (profile.following ?? []).includes(person.id);
    const isFollowedByPerson = (person.followers ?? []).includes(profile.id);
    const isMutual = isFollowing && isFollowedByPerson;

    if (isMutual) return 'Amigos';
    if (isFollowedByPerson && !isFollowing) return 'Seguir de Volta';
    if (isFollowing && !isFollowedByPerson) return 'Seguindo';
    return 'Seguir';
  };

  const getFollowButtonStyle = (person) => {
    const status = getFollowStatus(person);

    if (status === 'Amigos') {
      return [styles.followAction, styles.followActionMutual];
    }

    if (status === 'Seguir de Volta') {
      return [styles.followAction, styles.followActionReturn];
    }

    if (status === 'Seguindo') {
      return [styles.followAction, styles.followActionActive];
    }

    return [styles.followAction, styles.followActionPrimary];
  };

  const getFollowButtonTextStyle = (person) => {
    const status = getFollowStatus(person);

    if (status === 'Amigos' || status === 'Seguindo') {
      return [styles.followActionText, styles.followActionTextActive];
    }

    if (status === 'Seguir de Volta') {
      return [styles.followActionText, styles.followActionTextReturn];
    }

    return [styles.followActionText, styles.followActionTextPrimary];
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.screenContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topbar}>
            <View style={styles.logoWrap}>
              <Image source={LogoMiniSocial} style={styles.logoImage} resizeMode="contain" />
              <Text style={styles.triplyText}>Triply</Text>
            </View>

            <Text style={styles.centerTitle} accessibilityRole="header">Perfil</Text>

            <TouchableOpacity style={styles.settingsButton} activeOpacity={0.8}>
              <Image source={SenttingsIcon} style={styles.settingsIcon} resizeMode="contain" />
            </TouchableOpacity>
          </View>

        <View style={styles.avatarWrap}>
          <Image source={{ uri: profile.avatar }} style={styles.avatar} resizeMode="cover" />
          <TouchableOpacity style={styles.penButton} onPress={onEdit} activeOpacity={0.9}>
            <Image source={PenIcon} style={styles.penIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.username}>@{profile.username}</Text>

        <View style={styles.stats}>
          {[
            [profile.postsCount ?? visiblePosts.length, 'publicações'],
            [profile.followers?.length ?? 0, 'seguidores'],
            [profile.following?.length ?? 0, 'seguindo'],
          ].map(([value, label]) => (
            <TouchableOpacity
              key={label}
              style={styles.stat}
              activeOpacity={0.8}
              onPress={() => {
                if (label === 'seguidores') {
                  setPeopleListMode('followers');
                }

                if (label === 'seguindo') {
                  setPeopleListMode('following');
                }
              }}
            >
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.bio}>{profile.bio}</Text>

        <View style={styles.selectorRow}>
          <TouchableOpacity
            style={[styles.selectorCell, activeTab === 'posts' && styles.selectorCellActive]}
            onPress={() => setActiveTab('posts')}
            activeOpacity={0.85}
          >
            <Image
              source={GroupIcon}
              style={[styles.selectorIcon, activeTab === 'posts' && styles.selectorIconActive]}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.selectorCell, activeTab === 'favorites' && styles.selectorCellActive]}
            onPress={() => setActiveTab('favorites')}
            activeOpacity={0.85}
          >
            <Image
              source={FavIcon}
              style={[styles.selectorIcon, activeTab === 'favorites' && styles.selectorIconActive]}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {visiblePosts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Nenhuma publicação por aqui ainda.</Text>
            </View>
          ) : (
            visiblePosts.map((post) => {
              const isFavorite = profile.favoritePosts.includes(post.id);
              return (
                <View key={post.id} style={[styles.postCard, { width: itemWidth, marginBottom: gap }]}> 
                  <Image source={{ uri: post.image }} style={[styles.post, { height: itemWidth }]} resizeMode="cover" />
                  <TouchableOpacity
                    style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
                    onPress={() => toggleFavorite(post.id)}
                    activeOpacity={0.9}
                  >
                    <Image
                      source={FavIcon}
                      style={[styles.favoriteIcon, isFavorite && styles.favoriteIconActive]}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {peopleListMode && (
        <Animated.View style={[styles.modalOverlay, { opacity: modalAnim }]} pointerEvents="auto">
          <Animated.View
            style={[
              styles.modalCard,
              {
                transform: [
                  {
                    translateY: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [height, 0] }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{peopleListMode === 'followers' ? 'Seguidores' : 'Seguindo'}</Text>
              <TouchableOpacity
                onPress={() => {
                  Animated.timing(modalAnim, { toValue: 0, duration: 220, useNativeDriver: true }).start(() =>
                    setPeopleListMode(null)
                  );
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.closeText}>Fechar</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.peopleList} showsVerticalScrollIndicator={false}>
              {peopleList.length === 0 ? (
                <Text style={styles.emptyText}>Nenhuma pessoa por aqui.</Text>
              ) : (
                peopleList.map((person) => {
                  const status = getFollowStatus(person);
                  const isCurrentUser = person.id === profile.id;

                  return (
                    <View key={person.id} style={styles.personRow}>
                      <View style={styles.personMeta}>
                        <Image source={{ uri: person.avatar }} style={styles.personAvatar} resizeMode="cover" />
                        <View>
                          <Text style={styles.personName}>{person.name}</Text>
                          <Text style={styles.personUsername}>@{person.username}</Text>
                        </View>
                      </View>

                      {!isCurrentUser && (
                        <TouchableOpacity
                          style={getFollowButtonStyle(person)}
                          onPress={() => toggleFollow(person.id)}
                          activeOpacity={0.85}
                        >
                          <Text style={getFollowButtonTextStyle(person)}>{status}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })
              )}
            </ScrollView>
          </Animated.View>
        </Animated.View>
      )}

      <View style={styles.nav}>
        { [
          ['Home', HomeIcon],
          ['Criar', CreateIcon],
          ['Notificações', NotificationIcon],
          ['Perfil', PerfilIcon],
        ].map(([label, icon], index) => (
          <TouchableOpacity key={label} style={styles.navItem} activeOpacity={0.8}>
            <View style={[styles.navIconWrap, index === 3 && styles.navIconWrapActive]}>
              <Image
                source={icon}
                style={[styles.navIcon, index === 3 && styles.selectedNavIcon]}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.navLabel, index === 3 && styles.selectedNavLabel]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function EditProfile({ profile, updateProfile, onBack }) {
  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    try {
      setSaving(true);
      await updateProfile({ name, username, bio });
      onBack?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.editScreen} keyboardShouldPersistTaps="handled">
      <View style={styles.editHeader}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.8}>
          <Image source={BackIcon} style={styles.backIcon} resizeMode="contain" />
        </TouchableOpacity>
        <Text style={styles.editTitle}>Editar Perfil</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.avatarWrapEdit}>
        <Image source={{ uri: profile.avatar }} style={styles.avatarLarge} resizeMode="cover" />
        <TouchableOpacity style={styles.dotButton} activeOpacity={0.9}>
          <Image source={PenIcon} style={styles.dotIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      <Text style={styles.fieldLabel}>Nome</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.fieldLabel}>Usuário</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <Text style={styles.fieldLabel}>Bio</Text>
      <TextInput
        style={styles.bioInput}
        value={bio}
        onChangeText={setBio}
        multiline
        textAlignVertical="top"
      />

      <TouchableOpacity style={styles.saveButton} onPress={save} activeOpacity={0.9} disabled={saving}>
        <Text style={styles.saveText}>{saving ? 'Salvando...' : 'Salvar Alterações'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screenContent: {
    paddingBottom: 80,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  errorText: {
    color: '#D63C3C',
    fontSize: 14,
    textAlign: 'center',
  },
  topbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
  },
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 30,
    height: 30,
  },
  triplyText: {
    color: '#FD7509',
    fontSize: 19,
    fontWeight: '800',
    marginLeft: 6,
    letterSpacing: -0.3,
    fontFamily: baseFont,
  },
  centerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: '#111111',
    fontFamily: baseFont,
  },
  settingsButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    width: 22,
    height: 22,
  },
  profileTitle: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '800',
    color: '#111111',
    fontFamily: baseFont,
    letterSpacing: -0.8,
    marginTop: 8,
    marginBottom: 2,
  },
  avatarWrap: {
    alignSelf: 'center',
    width: 156,
    height: 156,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 6,
  },
  avatar: {
    width: 136,
    height: 136,
    borderRadius: 68,
    backgroundColor: '#0F0F0F',
  },
  penButton: {
    position: 'absolute',
    right: 8,
    bottom: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FD7509',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  penIcon: {
    width: 18,
    height: 18,
  },
  name: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: '#111111',
    fontFamily: baseFont,
    marginTop: 10,
    letterSpacing: -0.4,
  },
  username: {
    textAlign: 'center',
    fontSize: 15,
    color: '#7A7A7A',
    fontFamily: baseFont,
    marginTop: 2,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    marginTop: 16,
  },
  stat: {
    width: 102,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111111',
    fontFamily: baseFont,
  },
  statLabel: {
    fontSize: 11,
    color: '#7E7E7E',
    fontFamily: baseFont,
    marginTop: 3,
    textAlign: 'center',
  },
  bio: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
    color: '#202020',
    fontWeight: '600',
    marginTop: 18,
    fontFamily: baseFont,
    paddingHorizontal: 26,
  },
  selectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E8E8E8',
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  selectorCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
  },
  selectorCellActive: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    borderRightWidth: 1,
    borderRightColor: '#E8E8E8',
  },
  selectorIcon: {
    width: 22,
    height: 22,
    tintColor: '#1F1F1F',
  },
  selectorIconActive: {
    tintColor: '#FD7509',
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 18,
    paddingBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  postCard: {
    width: '32.5%',
    position: 'relative',
  },
  post: {
    width: '100%',
    height: 110,
    borderRadius: 12,
    backgroundColor: '#D9D9D9',
  },
  favoriteButton: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButtonActive: {
    backgroundColor: '#FD7509',
  },
  favoriteIcon: {
    width: 14,
    height: 14,
    tintColor: '#111111',
  },
  favoriteIconActive: {
    tintColor: '#FFFFFF',
  },
  emptyState: {
    width: '100%',
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#707070',
    fontSize: 13,
    fontFamily: baseFont,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 17, 17, 0.35)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 18,
    paddingHorizontal: 18,
    maxHeight: '68%',
    minHeight: 220,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111111',
    fontFamily: baseFont,
  },
  closeText: {
    color: '#FD7509',
    fontWeight: '700',
    fontFamily: baseFont,
  },
  peopleList: {
    paddingBottom: 18,
  },
  personRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  personMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  personAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  personName: {
    fontWeight: '700',
    color: '#111111',
    fontSize: 14,
    fontFamily: baseFont,
  },
  personUsername: {
    color: '#767676',
    fontSize: 12,
    fontFamily: baseFont,
    marginTop: 2,
  },
  followAction: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 104,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followActionPrimary: {
    backgroundColor: '#FD7509',
  },
  followActionReturn: {
    backgroundColor: '#FFE4CC',
  },
  followActionMutual: {
    backgroundColor: '#E7F7EA',
  },
  followActionActive: {
    backgroundColor: '#F0F0F0',
  },
  followActionText: {
    fontWeight: '700',
    fontSize: 12,
  },
  followActionTextPrimary: {
    color: '#FFFFFF',
  },
  followActionTextReturn: {
    color: '#B75A00',
  },
  followActionTextActive: {
    color: '#111111',
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E7E7E7',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 72,
  },
  navIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconWrapActive: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FD7509',
  },
  navIcon: {
    width: 22,
    height: 22,
    tintColor: '#111111',
  },
  selectedNavIcon: {
    tintColor: '#FFFFFF',
  },
  navLabel: {
    marginTop: 3,
    fontSize: 10,
    color: '#111111',
    fontFamily: baseFont,
  },
  selectedNavLabel: {
    color: '#FD7509',
  },
  editScreen: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 28,
    backgroundColor: '#FFFFFF',
  },
  editHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backIcon: {
    width: 22,
    height: 22,
    tintColor: '#FD7509',
  },
  editTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FD7509',
    fontFamily: baseFont,
    textAlign: 'center',
  },
  avatarWrapEdit: {
    alignSelf: 'center',
    width: 136,
    height: 136,
    marginTop: 16,
    marginBottom: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#0F0F0F',
  },
  dotButton: {
    position: 'absolute',
    right: 6,
    bottom: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FD7509',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotIcon: {
    width: 15,
    height: 15,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
    fontFamily: baseFont,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#B5B5B5',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#111111',
    fontFamily: baseFont,
  },
  bioInput: {
    minHeight: 106,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#B5B5B5',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111111',
    fontFamily: baseFont,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: 26,
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: '#FD7509',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: baseFont,
  },
});
