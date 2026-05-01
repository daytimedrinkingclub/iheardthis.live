import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { pb, normalizeUser, normalizeExperience } from '../lib/pb';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => normalizeUser(pb.authStore.record));
  const [profile, setProfile] = useState(() => normalizeUser(pb.authStore.record));
  const [userExperiences, setUserExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId) => {
    try {
      const record = await pb.collection('users').getOne(userId);
      setProfile(normalizeUser(record));
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, []);

  const fetchUserExperiences = useCallback(async (userId) => {
    try {
      const records = await pb.collection('experiences').getFullList({
        filter: `user_id = "${userId}"`,
        expand: 'artist_id',
        sort: '-created',
      });
      setUserExperiences(records.map(normalizeExperience));
    } catch (error) {
      console.error('Error fetching user experiences:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const current = pb.authStore.record;
    if (current) {
      const normalized = normalizeUser(current);
      setUser(normalized);
      setProfile(normalized);
      fetchUserExperiences(current.id);
    } else {
      setLoading(false);
    }

    const unsubscribe = pb.authStore.onChange((_token, record) => {
      const normalized = normalizeUser(record);
      setUser(normalized);
      if (record) {
        setProfile(normalized);
        fetchProfile(record.id);
        fetchUserExperiences(record.id);
      } else {
        setProfile(null);
        setUserExperiences([]);
      }
    });

    return unsubscribe;
  }, [fetchProfile, fetchUserExperiences]);

  const value = {
    user,
    profile,
    userExperiences,
    loading,
    refreshProfile: () => user && fetchProfile(user.id),
    refreshExperiences: () => user && fetchUserExperiences(user.id),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
