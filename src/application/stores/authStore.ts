import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../../shared/types';
import { LocalStorageService } from '../../infrastructure/storage/LocalStorage';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isEmailVerificationRequired: boolean;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setEmailVerificationRequired: (required: boolean) => void;
  logout: () => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isEmailVerificationRequired: false,

      // Actions
      setUser: (user) =>
        set(() => ({
          user,
          isAuthenticated: !!user,
          isEmailVerificationRequired: user ? !user.emailVerified : false,
        })),

      setLoading: (loading) => set({ isLoading: loading }),

      setEmailVerificationRequired: (required) => 
        set({ isEmailVerificationRequired: required }),

      logout: () => {
        LocalStorageService.clearAll();
        set({
          user: null,
          isAuthenticated: false,
          isEmailVerificationRequired: false,
        });
      },

      clearAuth: () => {
        LocalStorageService.clearAll();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isEmailVerificationRequired: false,
        });
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isEmailVerificationRequired: state.isEmailVerificationRequired,
      }),
      onRehydrateStorage: () => {
        return (state) => {
          // Validate that stored auth state matches local storage
          if (state) {
            const hasTokens = LocalStorageService.isAuthenticated();
            if (state.isAuthenticated && !hasTokens) {
              // Clear invalid auth state
              state.user = null;
              state.isAuthenticated = false;
              state.isEmailVerificationRequired = false;
            } else if (!state.isAuthenticated && hasTokens) {
              // User has tokens but store says not authenticated - let query handle it
              state.isAuthenticated = true;
            }
          }
        };
      },
    }
  )
);