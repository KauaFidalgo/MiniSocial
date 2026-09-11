import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  CURRENT_USER_ID,
  fetchAllPosts,
  fetchAllUsers,
  fetchCurrentUserProfile,
  toggleFollowRelationship,
  updateFavoritePosts,
  updateUserProfile,
} from '../services/profileService';

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[ProfileContext] Iniciando carregamento de dados...');

      const [user, posts, users] = await Promise.all([
        fetchCurrentUserProfile(CURRENT_USER_ID),
        fetchAllPosts(),
        fetchAllUsers(),
      ]);

      console.log('[ProfileContext] Dados carregados com sucesso');

      setProfile(user);
      setAllPosts(posts);
      setAllUsers(users);
    } catch (loadError) {
      console.error('[ProfileContext] Erro ao carregar dados:', loadError);
      setError(loadError.message || 'Erro ao carregar os dados do perfil.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial async fetch on mount, guarded internally by try/catch/finally
    loadData();
  }, [loadData]);

  const updateProfile = useCallback(
    async (updates) => {
      if (!profile) return null;

      const nextProfile = await updateUserProfile(profile.id, updates);
      setProfile((current) => ({ ...current, ...nextProfile }));
      return nextProfile;
    },
    [profile]
  );

  const toggleFavorite = useCallback(
    async (postId) => {
      if (!profile) return false;

      const favoritePosts = profile.favoritePosts.includes(postId)
        ? profile.favoritePosts.filter((id) => id !== postId)
        : [...profile.favoritePosts, postId];

      const updatedUser = await updateFavoritePosts(profile.id, favoritePosts);
      setProfile((current) => ({ ...current, ...updatedUser }));
      return updatedUser.favoritePosts.includes(postId);
    },
    [profile]
  );

  const toggleFollow = useCallback(
    async (targetUserId) => {
      if (!profile) return false;

      const isFollowing = (profile.following ?? []).includes(targetUserId);
      const nextIsFollowing = !isFollowing;

      await toggleFollowRelationship(profile.id, targetUserId, nextIsFollowing);

      setProfile((current) => ({
        ...current,
        following: nextIsFollowing
          ? [...new Set([...(current.following ?? []), targetUserId])]
          : (current.following ?? []).filter((id) => id !== targetUserId),
      }));

      setAllUsers((currentUsers) =>
        currentUsers.map((user) => {
          if (user.id === profile.id) {
            return {
              ...user,
              following: nextIsFollowing
                ? [...new Set([...(user.following ?? []), targetUserId])]
                : (user.following ?? []).filter((id) => id !== targetUserId),
            };
          }

          if (user.id === targetUserId) {
            return {
              ...user,
              followers: nextIsFollowing
                ? [...new Set([...(user.followers ?? []), profile.id])]
                : (user.followers ?? []).filter((id) => id !== profile.id),
            };
          }

          return user;
        })
      );

      return nextIsFollowing;
    },
    [profile]
  );

  const value = useMemo(
    () => ({
      profile,
      posts: allPosts,
      users: allUsers,
      loading,
      error,
      refresh: loadData,
      updateProfile,
      toggleFavorite,
      toggleFollow,
    }),
    [profile, allPosts, allUsers, loading, error, loadData, updateProfile, toggleFavorite, toggleFollow]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
