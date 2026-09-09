import React, { createContext, useContext, useMemo, useState } from 'react';

const ProfileContext = createContext(null);

const initialProfile = {
  name: 'Késsia Milena',
  username: 'kessia.milena',
  bio: 'Desenvolvedora e entusiasta de tecnologia. Apaixonada por compartilhar conhecimento!',
  stats: {
    posts: 12,
    followers: 150,
    following: 80,
  },
};

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(initialProfile);

  const updateProfile = (updates) => {
    setProfile((current) => ({ ...current, ...updates }));
  };

  const value = useMemo(() => ({ profile, updateProfile }), [profile]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}