import React, { useMemo, useState, useEffect } from 'react';

import {
  AccessibilityInfo,
  Alert,
  AppState,
  Easing,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Pressable,
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

import * as ImagePicker from 'expo-image-picker';

import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import BackIcon from '../../assets/Icons/BackIcon.png';
import FavIcon from '../../assets/Icons/FavIcon.png';
import GroupIcon from '../../assets/Icons/GroupIcon.png';
import LogoMiniSocial from '../../assets/Icons/LogoMiniSocial.png';
import PenIcon from '../../assets/Icons/PenIcon.png';
import SenttingsIcon from '../../assets/Icons/SenttingsIcon.png';

import BottomNav from '../components/BottomNav';
import { useProfile } from '../context/ProfileContext';

const baseFont = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

export default function ProfileScreen({
  mode = 'view',
  onEdit,
  onBack,
  onNavigate,
  onLogout,
  onSwitchAccount,
  homeDestination = 'home',
}) {
  const profileContext = useProfile();

  const {
    profile,
    posts,
    users,
    loading,
    error,
    toggleFavorite,
    toggleFollow,
    updateProfile,
  } = profileContext;

  const [activeTab, setActiveTab] = useState('posts');
  const [peopleListMode, setPeopleListMode] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profilePhotoOpen, setProfilePhotoOpen] = useState(false);

  const { width } = useWindowDimensions();

  /* =========================================================
     ENCERRAR SESSÃO
  ========================================================= */

  const endSession = async (switchAccount) => {
    const logout = onLogout || profileContext.logout;

    const navigate =
      switchAccount && typeof onSwitchAccount === 'function'
        ? onSwitchAccount
        : typeof onNavigate === 'function'
          ? () => onNavigate(homeDestination)
          : null;

    if (typeof logout !== 'function') {
      throw new Error(
        'O encerramento de sessão ainda não foi conectado ao Perfil. Configure onLogout com a função de logout do projeto.'
      );
    }

    if (!navigate) {
      throw new Error(
        'A navegação para a Home ainda não foi conectada ao Perfil.'
      );
    }

    const result = await logout();

    if (result === false) {
      throw new Error(
        'Não foi possível encerrar a sessão. Tente novamente.'
      );
    }

    setSettingsOpen(false);
    setPeopleListMode(null);
    setActiveTab('posts');

    try {
      await navigate();
    } catch {
      Alert.alert(
        'Sessão encerrada',
        'Não foi possível abrir a próxima tela. Use a navegação principal para voltar à Home.'
      );
    }
  };

  /* =========================================================
     PUBLICAÇÕES VISÍVEIS
  ========================================================= */

  const visiblePosts = useMemo(() => {
    if (!profile) return [];

    if (activeTab === 'favorites') {
      return posts.filter((post) =>
        (profile.favoritePosts ?? []).includes(post.id)
      );
    }

    return posts.filter(
      (post) => post.userId === profile.id
    );
  }, [activeTab, posts, profile]);

  /* =========================================================
     SEGUIDORES
  ========================================================= */

  const followerUsers = useMemo(
    () =>
      (profile?.followers ?? [])
        .map((id) =>
          users.find((user) => user.id === id)
        )
        .filter(Boolean),
    [profile, users]
  );

  /* =========================================================
     SEGUINDO
  ========================================================= */

  const followingUsers = useMemo(
    () =>
      (profile?.following ?? [])
        .map((id) =>
          users.find((user) => user.id === id)
        )
        .filter(Boolean),
    [profile, users]
  );

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator
          size="large"
          color="#FD7509"
        />
      </View>
    );
  }

  /* =========================================================
     ERRO
  ========================================================= */

  if (error || !profile) {
    return (
      <View style={styles.loadingWrap}>
        <Text style={styles.errorText}>
          {error ||
            'Não foi possível carregar o perfil.'}
        </Text>
      </View>
    );
  }

  /* =========================================================
     EDITAR PERFIL
  ========================================================= */

  if (mode === 'edit') {
    return (
      <EditProfile
        profile={profile}
        updateProfile={updateProfile}
        onBack={onBack}
      />
    );
  }

  /* =========================================================
     GRADE RESPONSIVA
  ========================================================= */

  const horizontalPadding = 24;
  const gap = 8;
  const columns = 3;

  const itemWidth = Math.floor(
    (width -
      horizontalPadding -
      gap * (columns - 1)) /
    columns
  );

  const peopleList =
    peopleListMode === 'followers'
      ? followerUsers
      : followingUsers;

  /* =========================================================
     STATUS DE RELACIONAMENTO
  ========================================================= */

  const getFollowStatus = (person) => {
    const isFollowing = (
      profile.following ?? []
    ).includes(person.id);

    const isFollowedByPerson = (
      profile.followers ?? []
    ).includes(person.id);

    const isMutual =
      isFollowing && isFollowedByPerson;

    if (isMutual) return 'Amigos';

    if (
      isFollowedByPerson &&
      !isFollowing
    ) {
      return 'Seguir de volta';
    }

    if (
      isFollowing &&
      !isFollowedByPerson
    ) {
      return 'Seguindo';
    }

    return 'Seguir';
  };

  /* =========================================================
     ESTILO DO BOTÃO DE SEGUIR
  ========================================================= */

  const getFollowButtonStyle = (person) => {
    const status = getFollowStatus(person);

    if (status === 'Amigos') {
      return [
        styles.followAction,
        styles.followActionMutual,
      ];
    }

    if (status === 'Seguir de volta') {
      return [
        styles.followAction,
        styles.followActionReturn,
      ];
    }

    if (status === 'Seguindo') {
      return [
        styles.followAction,
        styles.followActionActive,
      ];
    }

    return [
      styles.followAction,
      styles.followActionPrimary,
    ];
  };

  /* =========================================================
     TEXTO DO BOTÃO
  ========================================================= */

  const getFollowButtonTextStyle = (person) => {
    const status = getFollowStatus(person);

    if (
      status === 'Amigos' ||
      status === 'Seguindo'
    ) {
      return [
        styles.followActionText,
        styles.followActionTextActive,
      ];
    }

    if (status === 'Seguir de volta') {
      return [
        styles.followActionText,
        styles.followActionTextReturn,
      ];
    }

    return [
      styles.followActionText,
      styles.followActionTextPrimary,
    ];
  };

  return (
    <SafeAreaView
      style={styles.screenContainer}
      edges={['left', 'right']}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.screenContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* =====================================================
            TOP BAR
        ===================================================== */}

        <View style={styles.topbar}>
          <View style={styles.logoWrap}>
            <Image
              source={LogoMiniSocial}
              style={styles.logoImage}
              resizeMode="contain"
            />

            <Text style={styles.triplyText}>
              Triply
            </Text>
          </View>

          <Text
            style={styles.centerTitle}
            pointerEvents="none"
            accessibilityRole="header"
          >
            Perfil
          </Text>

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() =>
              setSettingsOpen(true)
            }
            accessibilityRole="button"
            accessibilityLabel="Abrir configurações"
            activeOpacity={0.8}
          >
            <Image
              source={SenttingsIcon}
              style={styles.settingsIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* =====================================================
            FOTO DE PERFIL
        ===================================================== */}

        <View style={styles.avatarWrap}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() =>
              setProfilePhotoOpen(true)
            }
            accessibilityRole="button"
            accessibilityLabel="Visualizar foto de perfil"
            style={styles.avatarTouchable}
          >
            <Image
              source={{ uri: profile.avatar }}
              style={styles.avatar}
              resizeMode="cover"
            />
          </TouchableOpacity>

          {/* BOTÃO DE EDITAR */}
          <TouchableOpacity
            style={styles.penButton}
            onPress={onEdit}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel="Editar foto de perfil"
          >
            <Image
              source={PenIcon}
              style={styles.penIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>
          {profile.name}
        </Text>

        <Text style={styles.username}>
          @{profile.username}
        </Text>

        {/* =====================================================
            ESTATÍSTICAS
        ===================================================== */}

        <View style={styles.stats}>
          {[
            [
              profile.postsCount ??
              visiblePosts.length,
              'publicações',
            ],
            [
              profile.followers?.length ?? 0,
              'seguidores',
            ],
            [
              profile.following?.length ?? 0,
              'seguindo',
            ],
          ].map(([value, label], index) => (
            <React.Fragment key={label}>
              <TouchableOpacity
                style={styles.stat}
                activeOpacity={0.8}
                onPress={() => {
                  if (label === 'seguidores') {
                    setPeopleListMode(
                      'followers'
                    );
                  }

                  if (label === 'seguindo') {
                    setPeopleListMode(
                      'following'
                    );
                  }
                }}
              >
                <Text style={styles.statValue}>
                  {value}
                </Text>

                <Text style={styles.statLabel}>
                  {label}
                </Text>
              </TouchableOpacity>

              {index < 2 && (
                <View
                  style={styles.statDivider}
                />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* =====================================================
            BIO
        ===================================================== */}

        <Text style={styles.bio}>
          {profile.bio}
        </Text>

        {/* =====================================================
            POSTS / FAVORITOS
        ===================================================== */}

        <View style={styles.selectorRow}>
          <TouchableOpacity
            style={styles.selectorCell}
            onPress={() =>
              setActiveTab('posts')
            }
            activeOpacity={0.7}
          >
            <Image
              source={GroupIcon}
              style={[
                styles.selectorIcon,
                activeTab === 'posts' &&
                styles.selectorIconActive,
              ]}
              resizeMode="contain"
            />

            {activeTab === 'posts' && (
              <View
                style={styles.selectorIndicator}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.selectorCell}
            onPress={() =>
              setActiveTab('favorites')
            }
            activeOpacity={0.7}
          >
            <Image
              source={FavIcon}
              style={[
                styles.selectorIcon,
                activeTab === 'favorites' &&
                styles.selectorIconActive,
              ]}
              resizeMode="contain"
            />

            {activeTab === 'favorites' && (
              <View
                style={styles.selectorIndicator}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* =====================================================
            GRADE DE POSTS
        ===================================================== */}

        <View style={styles.grid}>
          {visiblePosts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Nenhuma publicação por aqui ainda.
              </Text>
            </View>
          ) : (
            visiblePosts.map((post) => {
              const isFavorite =
                (
                  profile.favoritePosts ?? []
                ).includes(post.id);

              return (
                <View
                  key={post.id}
                  style={[
                    styles.postCard,
                    {
                      width: itemWidth,
                      marginBottom: gap,
                    },
                  ]}
                >
                  <Image
                    source={{
                      uri: post.image,
                    }}
                    style={[
                      styles.post,
                      {
                        height: itemWidth,
                      },
                    ]}
                    resizeMode="cover"
                  />

                  <TouchableOpacity
                    style={[
                      styles.favoriteButton,
                      isFavorite &&
                      styles.favoriteButtonActive,
                    ]}
                    onPress={() =>
                      toggleFavorite(post.id)
                    }
                    activeOpacity={0.9}
                    accessibilityRole="button"
                    accessibilityLabel={
                      isFavorite
                        ? 'Remover dos favoritos'
                        : 'Adicionar aos favoritos'
                    }
                  >
                    <Image
                      source={FavIcon}
                      style={[
                        styles.favoriteIcon,
                        isFavorite &&
                        styles.favoriteIconActive,
                      ]}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* =======================================================
          FOTO DE PERFIL EM DETALHES
      ======================================================= */}

      <ProfilePhotoModal
        uri={profile.avatar}
        visible={profilePhotoOpen}
        onClose={() =>
          setProfilePhotoOpen(false)
        }
      />

      {/* =======================================================
          SEGUIDORES / SEGUINDO
      ======================================================= */}

      {peopleListMode && (
        <PeoplePanel
          title={
            peopleListMode === 'followers'
              ? 'Seguidores'
              : 'Seguindo'
          }
          people={peopleList}
          profile={profile}
          toggleFollow={toggleFollow}
          getStatus={getFollowStatus}
          getButtonStyle={
            getFollowButtonStyle
          }
          getTextStyle={
            getFollowButtonTextStyle
          }
          onClose={() =>
            setPeopleListMode(null)
          }
        />
      )}

      {/* =======================================================
          CONFIGURAÇÕES
      ======================================================= */}

      {settingsOpen && (
        <AccountSettings
          key={profile.id}
          profile={profile}
          updateProfile={updateProfile}
          endSession={endSession}
          onClose={() =>
            setSettingsOpen(false)
          }
        />
      )}

      {/* =======================================================
          NAVEGAÇÃO INFERIOR
      ======================================================= */}

      <BottomNav
        active="perfil"
        onNavigate={onNavigate}
      />
    </SafeAreaView>
  );
}

/* =========================================================
   FOTO DE PERFIL EM DETALHES
========================================================= */

function ProfilePhotoModal({
  uri,
  visible,
  onClose,
}) {
  const { width, height } =
    useWindowDimensions();

  const progress =
    React.useRef(
      new Animated.Value(0)
    ).current;

  const [reduceMotion, setReduceMotion] =
    useState(false);

  useEffect(() => {
    let active = true;

    AccessibilityInfo
      .isReduceMotionEnabled()
      .then((value) => {
        if (active) {
          setReduceMotion(value);
        }
      })
      .catch(() => { });

    return () => {
      active = false;
      progress.stopAnimation();
    };
  }, [progress]);

  useEffect(() => {
    if (!visible) return;

    progress.setValue(0);

    Animated.timing(progress, {
      toValue: 1,
      duration: reduceMotion ? 0 : 220,
      easing: Easing.out(
        Easing.cubic
      ),
      useNativeDriver: true,
    }).start();
  }, [
    visible,
    reduceMotion,
    progress,
  ]);

  if (!visible) return null;

  const imageSize = Math.min(
    width - 40,
    height - 180
  );

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.photoModal}>
        {/* FUNDO CLICÁVEL */}
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Fechar foto"
        />

        {/* BOTÃO FECHAR */}
        <TouchableOpacity
          style={styles.photoCloseButton}
          onPress={onClose}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Fechar visualização da foto"
        >
          <Text style={styles.photoCloseText}>
            ×
          </Text>
        </TouchableOpacity>

        {/* FOTO */}
        <Animated.View
          style={[
            styles.photoViewer,
            {
              opacity: progress,
              transform: [
                {
                  scale:
                    progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [
                        0.88,
                        1,
                      ],
                    }),
                },
              ],
            },
          ]}
        >
          <Image
            source={{ uri }}
            style={[
              styles.photoDetail,
              {
                width: imageSize,
                height: imageSize,
              },
            ]}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    </Modal>
  );
}

/* =========================================================
   EDITAR PERFIL
========================================================= */

function EditProfile({
  profile,
  updateProfile,
  onBack,
}) {
  const [name, setName] = useState(
    profile.name
  );

  const [username, setUsername] =
    useState(profile.username);

  const [bio, setBio] = useState(
    profile.bio
  );

  const [avatar, setAvatar] = useState(
    profile.avatar
  );

  const [saving, setSaving] =
    useState(false);

  /* =======================================================
     SELECIONAR FOTO
  ======================================================= */

  const pickAvatar = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        alert(
          'Precisamos de permissão para acessar suas fotos.'
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync(
          {
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
          }
        );

      if (
        !result.canceled &&
        result.assets?.length > 0
      ) {
        const selectedImage =
          result.assets[0].uri;

        setAvatar(selectedImage);
      }
    } catch (error) {
      console.error(
        'Erro ao selecionar foto:',
        error
      );

      alert(
        'Não foi possível selecionar a imagem.'
      );
    }
  };

  /* =======================================================
     SALVAR PERFIL
  ======================================================= */

  const save = async () => {
    try {
      setSaving(true);

      await updateProfile({
        name,
        username,
        bio,
        avatar,
      });

      onBack?.();
    } catch (error) {
      console.error(
        'Erro ao salvar perfil:',
        error
      );

      alert(
        'Não foi possível salvar as alterações.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView
      style={styles.screenContainer}
      edges={['top', 'left', 'right']}
    >
      <KeyboardAvoidingView
        style={styles.editKeyboard}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          style={styles.screen}
          contentContainerStyle={
            styles.editScreen
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* CABEÇALHO */}

          <View style={styles.editHeader}>
            <TouchableOpacity
              onPress={onBack}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Voltar"
            >
              <Image
                source={BackIcon}
                style={styles.backIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <Text
              style={styles.editTitle}
            >
              Editar Perfil
            </Text>

            <View
              style={{ width: 28 }}
            />
          </View>

          {/* FOTO */}

          <View
            style={styles.avatarWrapEdit}
          >
            <Image
              source={{ uri: avatar }}
              style={styles.avatarLarge}
              resizeMode="cover"
            />

            <TouchableOpacity
              style={styles.dotButton}
              activeOpacity={0.9}
              onPress={pickAvatar}
              accessibilityRole="button"
              accessibilityLabel="Alterar foto"
            >
              <Image
                source={PenIcon}
                style={styles.dotIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          <Text
            style={styles.changePhotoText}
          >
            Toque no lápis para alterar
            sua foto
          </Text>

          {/* NOME */}

          <Text style={styles.fieldLabel}>
            Nome
          </Text>

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Digite seu nome"
            placeholderTextColor="#999999"
          />

          {/* USUÁRIO */}

          <Text style={styles.fieldLabel}>
            Usuário
          </Text>

          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholder="Digite seu usuário"
            placeholderTextColor="#999999"
          />

          {/* BIO */}

          <Text style={styles.fieldLabel}>
            Bio
          </Text>

          <TextInput
            style={styles.bioInput}
            value={bio}
            onChangeText={setBio}
            multiline
            textAlignVertical="top"
            placeholder="Conte um pouco sobre você..."
            placeholderTextColor="#999999"
          />

          {/* SALVAR */}

          <TouchableOpacity
            style={[
              styles.saveButton,
              saving &&
              styles.saveButtonDisabled,
            ]}
            onPress={save}
            activeOpacity={0.9}
            disabled={saving}
          >
            <Text style={styles.saveText}>
              {saving
                ? 'Salvando...'
                : 'Salvar Alterações'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* =========================================================
   ÍCONE DE VOLTAR — VETORIAL
========================================================= */

function HighQualityBackIcon() {
  return (
    <View
      style={ui.backIconVector}
      pointerEvents="none"
      accessible={false}
    >
      {/* LINHA HORIZONTAL */}
      <View style={ui.backIconStem} />

      {/* PONTA SUPERIOR */}
      <View
        style={[
          ui.backIconArm,
          ui.backIconArmTop,
        ]}
      />

      {/* PONTA INFERIOR */}
      <View
        style={[
          ui.backIconArm,
          ui.backIconArmBottom,
        ]}
      />
    </View>
  );
}

/* =========================================================
   PAINEL / MODAL
========================================================= */

function OverlayPanel({
  children,
  onClose,
  side = false,
  busy = false,
  title,
}) {
  const progress =
    React.useRef(
      new Animated.Value(0)
    ).current;

  const closing =
    React.useRef(false);

  const insets =
    useSafeAreaInsets();

  const { width } =
    useWindowDimensions();

  const [reduceMotion, setReduceMotion] =
    useState(false);

  useEffect(() => {
    let active = true;

    AccessibilityInfo
      .isReduceMotionEnabled()
      .then((value) => {
        if (active) {
          setReduceMotion(value);
        }
      })
      .catch(() => { });

    const subscription =
      AccessibilityInfo.addEventListener(
        'reduceMotionChanged',
        setReduceMotion
      );

    return () => {
      active = false;
      subscription?.remove?.();
      progress.stopAnimation();
    };
  }, [progress]);

  const enter = () => {
    progress.setValue(0);

    Animated.timing(progress, {
      toValue: 1,
      duration: reduceMotion
        ? 0
        : 240,
      easing: Easing.out(
        Easing.cubic
      ),
      useNativeDriver: true,
    }).start();
  };

  const close = () => {
    if (
      busy ||
      closing.current
    ) {
      return;
    }

    closing.current = true;

    Keyboard.dismiss();

    Animated.timing(progress, {
      toValue: 0,
      duration: reduceMotion
        ? 0
        : 180,
      easing: Easing.in(
        Easing.cubic
      ),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        onClose();
      }
    });
  };

  return (
    <Modal
      transparent
      visible
      animationType="none"
      onShow={enter}
      onRequestClose={close}
      statusBarTranslucent
      presentationStyle="overFullScreen"
    >
      <View
        style={[
          ui.overlay,
          side && ui.fullScreenOverlay,
        ]}
      >
        {/* FUNDO ESCURO */}

        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            ui.shade,
            {
              opacity: progress,
            },
          ]}
        >
          <Pressable
            style={
              StyleSheet.absoluteFillObject
            }
            onPress={close}
            accessibilityRole="button"
            accessibilityLabel="Fechar painel"
            disabled={busy}
          />
        </Animated.View>

        <KeyboardAvoidingView
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
          pointerEvents="box-none"
          style={[
            ui.panelHost,
            side && ui.sideHost,
          ]}
        >
          <Animated.View
            accessibilityViewIsModal
            onAccessibilityEscape={
              close
            }
            style={[
              ui.panel,

              side
                ? [
                  ui.fullScreenSidePanel,
                  {
                    width,
                    height: '100%',
                  },
                ]
                : ui.sheet,

              {
                paddingTop: Math.max(
                  insets.top,
                  18
                ),
                paddingBottom: Math.max(
                  insets.bottom,
                  18
                ),
                paddingLeft: Math.max(
                  insets.left,
                  18
                ),
                paddingRight: Math.max(
                  insets.right,
                  18
                ),

                opacity: progress,

                transform: side
                  ? [
                    {
                      translateX:
                        progress.interpolate(
                          {
                            inputRange: [
                              0,
                              1,
                            ],
                            outputRange: [
                              width,
                              0,
                            ],
                          }
                        ),
                    },
                  ]
                  : [
                    {
                      translateY:
                        progress.interpolate(
                          {
                            inputRange: [
                              0,
                              1,
                            ],
                            outputRange: [
                              40,
                              0,
                            ],
                          }
                        ),
                    },
                  ],
              },
            ]}
          >
            <View style={ui.header}>
              {!side && (
                <TouchableOpacity
                  onPress={close}
                  disabled={busy}
                  style={ui.iconButton}
                  accessibilityRole="button"
                  accessibilityLabel="Voltar ao perfil"
                  activeOpacity={0.7}
                >
                  <HighQualityBackIcon />
                </TouchableOpacity>
              )}

              <Text
                accessibilityRole="header"
                style={ui.title}
              >
                {title}
              </Text>

              <TouchableOpacity
                onPress={close}
                disabled={busy}
                style={ui.iconButton}
                accessibilityRole="button"
                accessibilityLabel="Fechar painel"
                activeOpacity={0.6}
              >
                <Text style={ui.close}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            {children}
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

/* =========================================================
   ÍCONE DE SENHA
========================================================= */

function EyeIcon({ hidden }) {
  return (
    <View
      accessible={false}
      style={ui.eyeWrap}
    >
      <View style={ui.eye}>
        <View style={ui.pupil} />
      </View>

      {hidden && (
        <View style={ui.eyeSlash} />
      )}
    </View>
  );
}

/* =========================================================
   BOTÃO DE AÇÃO
========================================================= */

function ActionButton({
  title,
  onPress,
  disabled,
  secondary = false,
  danger = false,
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{
        disabled: !!disabled,
      }}
      disabled={disabled}
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        ui.action,
        secondary && ui.secondary,
        danger && ui.danger,
        disabled && ui.disabled,
      ]}
    >
      <Text
        style={[
          ui.actionText,
          secondary && ui.secondaryText,
          danger && ui.dangerText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

/* =========================================================
   CONFIGURAÇÕES
========================================================= */

function AccountSettings({
  profile,
  updateProfile,
  onClose,
  endSession,
}) {
  const [step, setStep] =
    useState('account');

  const [newEmail, setNewEmail] =
    useState('');

  const [inputCode, setInputCode] =
    useState('');

  const [demoCode, setDemoCode] =
    useState('');

  const verification =
    React.useRef(null);

  const locked =
    React.useRef(false);

  const mounted =
    React.useRef(true);

  const [busy, setBusy] =
    useState(false);

  const [message, setMessage] =
    useState('');

  const [success, setSuccess] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const passwordOpacity =
    React.useRef(
      new Animated.Value(1)
    ).current;

  const password =
    typeof profile.password === 'string'
      ? profile.password
      : '';

  useEffect(() => {
    mounted.current = true;

    const subscription =
      AppState.addEventListener(
        'change',
        (state) => {
          if (state !== 'active') {
            setShowPassword(false);
          }
        }
      );

    return () => {
      mounted.current = false;
      verification.current = null;
      passwordOpacity.stopAnimation();
      subscription?.remove?.();
    };
  }, [passwordOpacity]);

  /* =======================================================
     RESET
  ======================================================= */

  const resetFlow = () => {
    verification.current = null;

    setDemoCode('');
    setInputCode('');
    setNewEmail('');
    setMessage('');
    setShowPassword(false);
    setStep('account');
  };

  /* =======================================================
     MOSTRAR SENHA
  ======================================================= */

  const reveal = () => {
    setShowPassword(
      (value) => !value
    );

    passwordOpacity.setValue(
      0.65
    );

    AccessibilityInfo
      .isReduceMotionEnabled()
      .then((reduced) => {
        if (mounted.current) {
          Animated.timing(
            passwordOpacity,
            {
              toValue: 1,
              duration: reduced
                ? 0
                : 130,
              useNativeDriver: true,
            }
          ).start();
        }
      })
      .catch(() =>
        passwordOpacity.setValue(1)
      );
  };

  /* =======================================================
     ENVIAR CÓDIGO
  ======================================================= */

  const sendCode = () => {
    const email =
      newEmail.trim();

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      setMessage(
        'Informe um e-mail válido, como nome@exemplo.com.'
      );

      return;
    }

    if (
      email.toLowerCase() ===
      (profile.email || '').toLowerCase()
    ) {
      setMessage(
        'Este já é o e-mail cadastrado. Informe outro endereço.'
      );

      return;
    }

    const code = String(
      Math.floor(
        100000 +
        Math.random() *
        900000
      )
    );

    verification.current = {
      code,
      email,
      expires:
        Date.now() +
        5 * 60 * 1000,
      attempts: 0,
    };

    setInputCode('');
    setMessage('');
    setSuccess('');
    setStep('verify');

    setDemoCode(
      Platform.OS === 'web'
        ? code
        : ''
    );

    Keyboard.dismiss();

    Alert.alert(
      'Triply • Verificação demonstrativa',
      `Seu código é ${code}. Válido por 5 minutos. Nenhum e-mail foi enviado.`
    );
  };

  /* =======================================================
     VERIFICAR E-MAIL
  ======================================================= */

  const verifyEmail = async () => {
    if (locked.current) return;

    const pending =
      verification.current;

    if (
      !pending ||
      Date.now() >
      pending.expires ||
      pending.attempts >= 5
    ) {
      setMessage(
        'Código expirado ou limite de tentativas atingido. Gere outro código.'
      );

      return;
    }

    if (
      inputCode !== pending.code
    ) {
      pending.attempts += 1;

      setMessage(
        pending.attempts >= 5
          ? 'Limite de tentativas atingido. Gere outro código.'
          : 'Código incorreto. Confira os seis dígitos e tente novamente.'
      );

      return;
    }

    locked.current = true;
    setBusy(true);
    setMessage('');

    try {
      const result =
        await updateProfile({
          email: pending.email,
        });

      if (result === false) {
        throw new Error('save');
      }

      if (mounted.current) {
        resetFlow();

        setSuccess(
          'E-mail atualizado com sucesso!'
        );
      }
    } catch {
      if (mounted.current) {
        setMessage(
          'Não foi possível atualizar o e-mail. Tente novamente.'
        );
      }
    } finally {
      locked.current = false;

      if (mounted.current) {
        setBusy(false);
      }
    }
  };

  /* =======================================================
     SAIR / TROCAR CONTA
  ======================================================= */

  const confirmExit = async () => {
    if (locked.current) return;

    locked.current = true;
    setBusy(true);
    setMessage('');
    setShowPassword(false);

    verification.current = null;
    setDemoCode('');
    setInputCode('');
    setNewEmail('');

    try {
      await endSession(
        step === 'switch'
      );
    } catch (error) {
      if (mounted.current) {
        setMessage(
          error.message ||
          'Não foi possível sair. Tente novamente.'
        );
      }
    } finally {
      locked.current = false;

      if (mounted.current) {
        setBusy(false);
      }
    }
  };

  return (
    <OverlayPanel
      title="Configurações"
      side
      onClose={onClose}
      busy={busy}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          ui.settingsContent
        }
      >
        <Text style={ui.brand}>
          Triply
        </Text>

        <Text style={ui.subtitle}>
          Sua conta, sua próxima viagem.
        </Text>

        {!!success && (
          <Text
            accessibilityLiveRegion="polite"
            style={ui.success}
          >
            {success}
          </Text>
        )}

        {step === 'account' ? (
          <>
            <Text
              style={ui.sectionLabel}
            >
              INFORMAÇÕES DA CONTA
            </Text>

            <View
              style={ui.accountCard}
            >
              <Text style={ui.label}>
                E-mail
              </Text>

              <Text
                selectable
                style={ui.value}
              >
                {profile.email ||
                  'E-mail não disponível no perfil'}
              </Text>

              <ActionButton
                title="Alterar e-mail"
                secondary
                onPress={() => {
                  setSuccess('');
                  setMessage('');
                  setShowPassword(
                    false
                  );
                  setStep('email');
                }}
              />
            </View>

            <View
              style={ui.accountCard}
            >
              <Text style={ui.label}>
                Senha da conta
              </Text>

              <View
                style={ui.passwordRow}
              >
                <Animated.Text
                  style={[
                    ui.password,
                    {
                      opacity:
                        passwordOpacity,
                    },
                  ]}
                >
                  {showPassword
                    ? password
                    : '••••••••'}
                </Animated.Text>

                <TouchableOpacity
                  onPress={reveal}
                  disabled={!password}
                  activeOpacity={0.6}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showPassword
                      ? 'Ocultar senha'
                      : 'Ver senha'
                  }
                  accessibilityState={{
                    disabled: !password,
                  }}
                  style={[
                    ui.iconButton,
                    !password &&
                    ui.disabled,
                  ]}
                >
                  <EyeIcon
                    hidden={!showPassword}
                  />
                </TouchableOpacity>
              </View>

              <Text style={ui.hint}>
                {password
                  ? 'Visualização disponível apenas neste protótipo local.'
                  : 'A senha de cadastro não foi disponibilizada pelo contexto. Nenhuma senha fictícia é exibida.'}
              </Text>
            </View>

            <Text
              style={ui.sectionLabel}
            >
              SESSÃO
            </Text>

            <ActionButton
              title="Sair da conta"
              danger
              onPress={() => {
                setMessage('');
                setStep('logout');
              }}
            />
          </>
        ) : step === 'email' ||
          step === 'verify' ? (
          <>
            <Text
              style={ui.sectionHeading}
            >
              {step === 'email'
                ? 'Alterar e-mail'
                : 'Verificar novo e-mail'}
            </Text>

            <Text style={ui.hint}>
              {step === 'email'
                ? 'Digite o endereço que deseja usar na sua conta.'
                : `Insira o código demonstrativo para ${verification.current
                  ?.email ||
                newEmail.trim()
                }.`}
            </Text>

            <Text style={ui.label}>
              {step === 'email'
                ? 'Novo e-mail'
                : 'Código de verificação'}
            </Text>

            {step === 'email' ? (
              <TextInput
                accessibilityLabel="Novo e-mail"
                style={ui.textInput}
                value={newEmail}
                onChangeText={(text) => {
                  setNewEmail(text);
                  setMessage('');
                }}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                placeholder="nome@exemplo.com"
                placeholderTextColor="#8A8A8A"
                maxLength={254}
                onSubmitEditing={
                  sendCode
                }
                returnKeyType="next"
              />
            ) : (
              <TextInput
                accessibilityLabel="Código de seis dígitos"
                style={[
                  ui.textInput,
                  ui.codeInput,
                ]}
                value={inputCode}
                editable={!busy}
                maxLength={6}
                keyboardType="number-pad"
                onChangeText={(text) => {
                  setInputCode(
                    text.replace(
                      /\D/g,
                      ''
                    )
                  );

                  setMessage('');
                }}
                placeholder="000000"
                placeholderTextColor="#8A8A8A"
                onSubmitEditing={
                  verifyEmail
                }
              />
            )}

            {!!demoCode && (
              <Text
                selectable
                style={ui.demo}
              >
                Código de demonstração:{' '}
                {demoCode}
              </Text>
            )}

            <ActionButton
              title={
                busy
                  ? 'Salvando...'
                  : step === 'email'
                    ? 'Gerar código'
                    : 'Confirmar alteração'
              }
              disabled={
                busy ||
                (step === 'verify' &&
                  inputCode.length !== 6)
              }
              onPress={
                step === 'email'
                  ? sendCode
                  : verifyEmail
              }
            />

            {step === 'verify' && (
              <ActionButton
                title="Gerar novo código"
                secondary
                disabled={busy}
                onPress={sendCode}
              />
            )}

            <ActionButton
              title="Cancelar"
              secondary
              disabled={busy}
              onPress={resetFlow}
            />

            <Text style={ui.hint}>
              Simulação em duas etapas,
              sem envio de e-mail e sem
              autenticação real.
            </Text>
          </>
        ) : (
          <>
            <Text
              style={ui.sectionHeading}
            >
              {step === 'switch'
                ? 'Entrar com outra conta?'
                : 'Sair da conta?'}
            </Text>

            <Text style={ui.hint}>
              {step === 'switch'
                ? 'Sua sessão atual será encerrada antes de continuar para outra conta.'
                : 'Sua sessão será encerrada e você voltará para a Home. Seu perfil e suas publicações não serão apagados.'}
            </Text>

            <ActionButton
              title={
                busy
                  ? 'Encerrando sessão...'
                  : 'Confirmar'
              }
              danger
              disabled={busy}
              onPress={confirmExit}
            />

            <ActionButton
              title="Continuar na minha conta"
              secondary
              disabled={busy}
              onPress={resetFlow}
            />
          </>
        )}

        {!!message && (
          <Text
            accessibilityRole="alert"
            accessibilityLiveRegion="assertive"
            style={ui.error}
          >
            {message}
          </Text>
        )}
      </ScrollView>
    </OverlayPanel>
  );
}

/* =========================================================
   PAINEL DE SEGUIDORES / SEGUINDO
========================================================= */

function PeoplePanel({
  title,
  people,
  profile,
  toggleFollow,
  getStatus,
  getButtonStyle,
  getTextStyle,
  onClose,
}) {
  const [pending, setPending] =
    useState({});

  const inFlight =
    React.useRef(new Set());

  const alive =
    React.useRef(true);

  const [message, setMessage] =
    useState('');

  const {
    width,
    fontScale,
  } = useWindowDimensions();

  useEffect(() => {
    alive.current = true;

    return () => {
      alive.current = false;
    };
  }, []);

  const follow = async (person) => {
    if (
      inFlight.current.has(
        person.id
      )
    ) {
      return;
    }

    inFlight.current.add(
      person.id
    );

    setPending((value) => ({
      ...value,
      [person.id]: true,
    }));

    setMessage('');

    try {
      const result =
        await toggleFollow(
          person.id
        );

      if (result === false) {
        throw new Error('follow');
      }
    } catch {
      if (alive.current) {
        setMessage(
          'Não foi possível atualizar. Tente novamente.'
        );
      }
    } finally {
      inFlight.current.delete(
        person.id
      );

      if (alive.current) {
        setPending((value) => ({
          ...value,
          [person.id]: false,
        }));
      }
    }
  };

  return (
    <OverlayPanel
      title={title}
      onClose={onClose}
    >
      <Text style={ui.subtitle}>
        Conexões para compartilhar
        novas viagens.
      </Text>

      {!!message && (
        <Text
          accessibilityRole="alert"
          style={ui.error}
        >
          {message}
        </Text>
      )}

      <FlatList
        data={people}
        keyExtractor={(person) =>
          String(person.id)
        }
        showsVerticalScrollIndicator={
          false
        }
        style={ui.list}
        contentContainerStyle={
          ui.listContent
        }
        ListEmptyComponent={
          <View
            style={styles.emptyState}
          >
            <Text
              style={
                ui.sectionHeading
              }
            >
              Novas conexões começam
              aqui
            </Text>

            <Text style={ui.hint}>
              Nenhuma pessoa nesta lista
              por enquanto.
            </Text>
          </View>
        }
        renderItem={({
          item: person,
        }) => {
          const status =
            getStatus(person);

          const following = (
            profile.following || []
          ).includes(person.id);

          return (
            <View
              style={[
                ui.person,
                (width < 360 ||
                  fontScale > 1.2) &&
                ui.personNarrow,
              ]}
            >
              <View
                style={ui.personMeta}
              >
                {person.avatar ? (
                  <Image
                    source={{
                      uri: person.avatar,
                    }}
                    style={ui.avatar}
                  />
                ) : (
                  <View
                    style={[
                      ui.avatar,
                      ui.avatarFallback,
                    ]}
                  >
                    <Text
                      style={ui.brand}
                    >
                      {(
                        person.name ||
                        '?'
                      ).slice(0, 1)}
                    </Text>
                  </View>
                )}

                <View
                  style={ui.personText}
                >
                  <Text
                    numberOfLines={1}
                    style={
                      styles.personName
                    }
                  >
                    {person.name}
                  </Text>

                  <Text
                    numberOfLines={1}
                    style={
                      styles.personUsername
                    }
                  >
                    @{person.username}
                  </Text>

                  {status ===
                    'Amigos' && (
                      <Text
                        style={ui.mutual}
                      >
                        Vocês se seguem
                      </Text>
                    )}
                </View>
              </View>

              {person.id !==
                profile.id && (
                  <TouchableOpacity
                    activeOpacity={0.65}
                    accessibilityRole="button"
                    accessibilityLabel={`${status}: ${person.name}`}
                    accessibilityHint={
                      following
                        ? 'Toque para deixar de seguir'
                        : 'Toque para seguir'
                    }
                    accessibilityState={{
                      disabled:
                        !!pending[
                        person.id
                        ],
                      busy:
                        !!pending[
                        person.id
                        ],
                    }}
                    disabled={
                      !!pending[
                      person.id
                      ]
                    }
                    onPress={() =>
                      follow(person)
                    }
                    style={[
                      getButtonStyle(
                        person
                      ),
                      ui.followButton,
                      pending[
                      person.id
                      ] &&
                      ui.disabled,
                    ]}
                  >
                    {pending[
                      person.id
                    ] ? (
                      <ActivityIndicator
                        size="small"
                        color="#833800"
                      />
                    ) : (
                      <Text
                        style={[
                          getTextStyle(
                            person
                          ),
                          ui.followText,
                        ]}
                      >
                        {status}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
            </View>
          );
        }}
      />
    </OverlayPanel>
  );
}

/* =========================================================
   STYLES
========================================================= */

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
    paddingBottom: 100,
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

  /* =====================================================
     TOPBAR
  ===================================================== */

  topbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 4,
    minHeight: 52,
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
    width: 44,
    height: 44,
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

  /* =====================================================
     AVATAR
  ===================================================== */

  avatarWrap: {
    alignSelf: 'center',
    width: 156,
    height: 156,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 6,
  },

  avatarTouchable: {
    width: 136,
    height: 136,
    borderRadius: 68,
    overflow: 'hidden',
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

  /* =====================================================
     NOME
  ===================================================== */

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

  /* =====================================================
     ESTATÍSTICAS
  ===================================================== */

  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 16,
  },

  stat: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },

  statDivider: {
    width: 1,
    height: 38,
    backgroundColor: '#DEDEDE',
  },

  statValue: {
    fontSize: 21,
    fontWeight: '700',
    color: '#111111',
    fontFamily: baseFont,
  },

  statLabel: {
    fontSize: 12,
    color: '#8A8A8A',
    fontFamily: baseFont,
    fontWeight: '600',
    marginTop: 3,
    textAlign: 'center',
  },

  /* =====================================================
     BIO
  ===================================================== */

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

  /* =====================================================
     POSTS / FAVORITOS
  ===================================================== */

  selectorRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '100%',
    marginTop: 22,
    height: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#E3E3E3',
  },

  selectorCell: {
    flex: 1,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  selectorIcon: {
    width: 25,
    height: 25,
    tintColor: '#171717',
    opacity: 0.9,
  },

  selectorIconActive: {
    tintColor: '#FD7509',
    opacity: 1,
  },

  selectorIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    width: '100%',
    height: 3,
    borderRadius: 2,
    backgroundColor: '#FD7509',
  },

  /* =====================================================
     GRID
  ===================================================== */

  grid: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
    paddingTop: 18,
    paddingBottom: 12,
    flexWrap: 'wrap',
    columnGap: 8,
    rowGap: 10,
  },

  postCard: {
    position: 'relative',
  },

  post: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#D9D9D9',
  },

  favoriteButton: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor:
      'rgba(255,255,255,0.9)',
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

  /* =====================================================
     EMPTY
  ===================================================== */

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

  /* =====================================================
     MODAL
  ===================================================== */

  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:
      'rgba(17, 17, 17, 0.35)',
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

  /* =====================================================
     FOTO GRANDE
  ===================================================== */

  photoModal: {
    flex: 1,
    backgroundColor:
      'rgba(0, 0, 0, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  photoViewer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  photoDetail: {
    borderRadius: 12,
  },

  photoCloseButton: {
    position: 'absolute',
    top: Platform.OS === 'android'
      ? 34
      : 54,
    right: 18,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor:
      'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  photoCloseText: {
    color: '#FFFFFF',
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '300',
  },

  /* =====================================================
     EDITAR PERFIL
  ===================================================== */

  editKeyboard: {
    flex: 1,
  },

  editScreen: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 60,
    backgroundColor: '#FFFFFF',
  },

  editHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  backIcon: {
    width: 18,
    height: 18,
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
    marginBottom: 8,
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

  changePhotoText: {
    textAlign: 'center',
    color: '#7A7A7A',
    fontSize: 12,
    fontFamily: baseFont,
    marginTop: 0,
    marginBottom: 8,
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

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: baseFont,
  },
});

/* =========================================================
   UI DOS PAINÉIS
========================================================= */

const ui = StyleSheet.create({
  overlay: {
    flex: 1,
  },

  fullScreenOverlay: {
    width: '100%',
    height: '100%',
  },

  shade: {
    backgroundColor:
      'rgba(20, 25, 31, 0.38)',
  },

  panelHost: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  sideHost: {
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    width: '100%',
    height: '100%',
  },

  panel: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#17202A',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: {
      width: -3,
      height: 0,
    },
    elevation: 12,
  },

  fullScreenSidePanel: {
    borderRadius: 0,
    alignSelf: 'stretch',
  },

  sheet: {
    width: '100%',
    maxWidth: 640,
    height: '92%',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },

  title: {
    flex: 1,
    fontFamily: baseFont,
    fontSize: 20,
    fontWeight: '700',
    color: '#20242A',
  },

  iconButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },

  /* =====================================================
     NOVO ÍCONE DE VOLTAR
  ===================================================== */

  backIconVector: {
    width: 24,
    height: 24,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backIconStem: {
    position: 'absolute',
    left: 5,
    right: 1,
    top: 10.7,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: '#FD7509',
  },

  backIconArm: {
    position: 'absolute',
    left: 3,
    width: 11,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: '#FD7509',
  },

  backIconArmTop: {
    top: 7.1,
    transform: [
      {
        rotate: '-45deg',
      },
    ],
  },

  backIconArmBottom: {
    top: 13.1,
    transform: [
      {
        rotate: '45deg',
      },
    ],
  },

  close: {
    fontSize: 30,
    color: '#525961',
    lineHeight: 34,
  },

  settingsContent: {
    paddingBottom: 30,
  },

  brand: {
    color: '#FD7509',
    fontSize: 20,
    fontWeight: '800',
    fontFamily: baseFont,
  },

  subtitle: {
    color: '#737982',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 18,
    marginTop: 4,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    color: '#737982',
    marginTop: 22,
    marginBottom: 12,
  },

  sectionHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#20242A',
    marginVertical: 12,
  },

  accountCard: {
    backgroundColor: '#FAFAF9',
    borderWidth: 1,
    borderColor: '#EFEDE9',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#363C44',
    marginBottom: 8,
    marginTop: 4,
  },

  value: {
    fontSize: 14,
    color: '#656C74',
    lineHeight: 22,
    flexShrink: 1,
  },

  hint: {
    fontSize: 13,
    lineHeight: 21,
    color: '#737982',
    marginVertical: 8,
  },

  action: {
    minHeight: 48,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FD7509',
    marginTop: 10,
  },

  secondary: {
    backgroundColor: '#FFF2E7',
    borderWidth: 1,
    borderColor: '#FFE0C5',
  },

  danger: {
    backgroundColor: '#FFF1EE',
    borderWidth: 1,
    borderColor: '#F7DCD5',
  },

  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },

  secondaryText: {
    color: '#984100',
  },

  dangerText: {
    color: '#AF3626',
  },

  disabled: {
    opacity: 0.5,
  },

  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  password: {
    flex: 1,
    color: '#363C44',
    fontSize: 16,
    lineHeight: 24,
  },

  eyeWrap: {
    width: 26,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  eye: {
    width: 22,
    height: 14,
    borderWidth: 1.7,
    borderColor: '#626973',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pupil: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#626973',
  },

  eyeSlash: {
    position: 'absolute',
    width: 27,
    height: 2,
    backgroundColor: '#626973',
    transform: [
      {
        rotate: '-45deg',
      },
    ],
  },

  textInput: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#DEDCD8',
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#20242A',
    backgroundColor: '#FAFAF9',
    marginBottom: 8,
  },

  codeInput: {
    letterSpacing: 7,
    textAlign: 'center',
    fontSize: 23,
  },

  success: {
    backgroundColor: '#EDF8EF',
    color: '#256738',
    padding: 14,
    borderRadius: 12,
    lineHeight: 21,
    marginVertical: 10,
  },

  error: {
    backgroundColor: '#FFF1EE',
    color: '#AF3626',
    padding: 14,
    borderRadius: 12,
    lineHeight: 21,
    marginVertical: 10,
  },

  demo: {
    backgroundColor: '#FFF2E7',
    color: '#984100',
    padding: 12,
    borderRadius: 12,
    lineHeight: 22,
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingTop: 6,
    paddingBottom: 20,
  },

  person: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderWidth: 1,
    borderColor: '#F0EEEB',
    backgroundColor: '#FCFCFB',
    borderRadius: 18,
    padding: 12,
    marginBottom: 10,
  },

  personNarrow: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },

  personMeta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },

  personText: {
    flex: 1,
    minWidth: 0,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F4E9DF',
  },

  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  mutual: {
    color: '#377546',
    fontSize: 11,
    marginTop: 4,
  },

  followButton: {
    minHeight: 44,
    minWidth: 100,
    borderRadius: 12,
    paddingHorizontal: 12,
  },

  followText: {
    textAlign: 'center',
    flexShrink: 1,
  },
});