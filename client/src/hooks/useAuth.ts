import { useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getDatabase, ref, onValue } from 'firebase/database';
import { auth } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';
import { ForgeUser } from '../types/user';

export const useAuth = () => {
  const { firebaseUser, profile, loading, setAuth, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        logout();
        return;
      }

      // If user exists, subscribe to their profile in RTDB
      const db = getDatabase();
      const userRef = ref(db, `users/${user.uid}`);
      
      const unsubscribeDb = onValue(
        userRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const profileData = snapshot.val() as ForgeUser;
            setAuth(user, profileData);
          } else {
            // If the profile does not exist yet in RTDB, set profile to null
            setAuth(user, null);
          }
        },
        (error) => {
          console.error('Error fetching user profile:', error);
          setAuth(user, null);
        }
      );

      return () => {
        unsubscribeDb();
      };
    });

    return () => {
      unsubscribeAuth();
    };
  }, [setAuth, logout]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error during sign out:', error);
    } finally {
      logout();
    }
  };

  return {
    user: firebaseUser,
    profile,
    loading,
    logout: handleLogout,
    isAuthenticated: !!firebaseUser && !!profile,
    isPendingAccess: !!firebaseUser && (!profile || profile.role === 'USER'),
    isMember: !!profile && (profile.role === 'MEMBER' || profile.role === 'ADMIN'),
    isAdmin: !!profile && profile.role === 'ADMIN',
  };
};
