import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';
import { ForgeUser } from '../types/user';

interface AuthState {
  firebaseUser: FirebaseUser | null;
  profile: ForgeUser | null;
  loading: boolean;
  setAuth: (firebaseUser: FirebaseUser | null, profile: ForgeUser | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  profile: null,
  loading: true,
  setAuth: (firebaseUser, profile) => set({ firebaseUser, profile, loading: false }),
  setLoading: (loading) => set({ loading }),
  logout: () => set({ firebaseUser: null, profile: null, loading: false }),
}));
