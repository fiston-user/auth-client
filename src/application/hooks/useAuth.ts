import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import { ApiAuthRepository } from '../../infrastructure/repositories/ApiAuthRepository';
import { LocalStorageService } from '../../infrastructure/storage/LocalStorage';
import { QUERY_KEYS, ROUTES, TOAST_DURATION } from '../../shared/constants';
import type { LoginFormData, RegisterFormData, EmailVerificationFormData } from '../../shared/validators';
import type { ApiError } from '../../shared/types';

// Create repository instance lazily to avoid initialization issues
const getAuthRepository = () => new ApiAuthRepository();

export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    isEmailVerificationRequired,
    setUser, 
    logout: logoutStore 
  } = useAuthStore();

  // Get current user profile
  const { data: currentUser, isLoading: isUserLoading, error: userError } = useQuery({
    queryKey: QUERY_KEYS.AUTH.USER,
    queryFn: () => getAuthRepository().getCurrentUser(),
    enabled: isAuthenticated && LocalStorageService.isAuthenticated(),
    retry: false,
  });

  // Handle user fetch error - clear auth if user fetch fails
  useEffect(() => {
    if (userError && isAuthenticated) {
      console.error('Failed to fetch user, clearing auth:', userError);
      LocalStorageService.clearAll();
      useAuthStore.getState().clearAuth();
    }
  }, [userError, isAuthenticated]);

  // Update store when currentUser is fetched successfully
  useEffect(() => {
    if (currentUser && (!user || currentUser.emailVerified !== user.emailVerified)) {
      console.log('Updating user state from query:', currentUser);
      setUser(currentUser);
      LocalStorageService.setUser(currentUser);
    }
  }, [currentUser, user, setUser]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginFormData) => getAuthRepository().login(credentials),
    onSuccess: (response) => {
      LocalStorageService.setTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
      LocalStorageService.setUser(response.user);
      setUser(response.user);
      
      toast.success('Welcome back!', { duration: TOAST_DURATION.SUCCESS });
      
      if (!response.user.emailVerified) {
        navigate(ROUTES.VERIFY_EMAIL);
      } else {
        navigate(ROUTES.DASHBOARD);
      }
    },
    onError: (error: ApiError) => {
      toast.error(error.message, { duration: TOAST_DURATION.ERROR });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (userData: RegisterFormData) => getAuthRepository().register(userData),
    onSuccess: (response) => {
      LocalStorageService.setTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
      LocalStorageService.setUser(response.user);
      setUser(response.user);
      
      toast.success('Account created! Please verify your email.', { 
        duration: TOAST_DURATION.SUCCESS 
      });
      navigate(ROUTES.VERIFY_EMAIL);
    },
    onError: (error: ApiError) => {
      const message = error.validation?.email?.[0] || error.message;
      toast.error(message, { duration: TOAST_DURATION.ERROR });
    },
  });

  // Email verification mutation
  const verifyEmailMutation = useMutation({
    mutationFn: (data: EmailVerificationFormData) => getAuthRepository().verifyEmail(data),
    onSuccess: async () => {
      // Update user state immediately
      if (user) {
        const updatedUser = { ...user, emailVerified: true };
        setUser(updatedUser);
        LocalStorageService.setUser(updatedUser);
      }
      
      // Also refetch user to get latest data from server
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.USER });
      
      toast.success('Email verified successfully!', { duration: TOAST_DURATION.SUCCESS });
      navigate(ROUTES.DASHBOARD);
    },
    onError: (error: ApiError) => {
      toast.error(error.message, { duration: TOAST_DURATION.ERROR });
    },
  });

  // Resend verification mutation
  const resendVerificationMutation = useMutation({
    mutationFn: (email: string) => getAuthRepository().resendVerification(email),
    onSuccess: () => {
      toast.success('Verification code sent!', { duration: TOAST_DURATION.SUCCESS });
    },
    onError: (error: ApiError) => {
      toast.error(error.message, { duration: TOAST_DURATION.ERROR });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => {
      const refreshToken = LocalStorageService.getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token');
      return getAuthRepository().logout(refreshToken);
    },
    onSuccess: () => {
      logoutStore();
      queryClient.clear();
      toast.success('Logged out successfully', { duration: TOAST_DURATION.SUCCESS });
      navigate(ROUTES.LOGIN);
    },
    onError: () => {
      // Still log out locally even if server logout fails
      logoutStore();
      queryClient.clear();
      toast.error('Logged out (with errors)', { duration: TOAST_DURATION.ERROR });
      navigate(ROUTES.LOGIN);
    },
  });

  // Logout from all devices mutation
  const logoutAllMutation = useMutation({
    mutationFn: () => getAuthRepository().logoutAll(),
    onSuccess: () => {
      logoutStore();
      queryClient.clear();
      toast.success('Logged out from all devices', { duration: TOAST_DURATION.SUCCESS });
      navigate(ROUTES.LOGIN);
    },
    onError: () => {
      logoutStore();
      queryClient.clear();
      toast.error('Logged out (with errors)', { duration: TOAST_DURATION.ERROR });
      navigate(ROUTES.LOGIN);
    },
  });

  return {
    // State
    user: user || currentUser,
    isAuthenticated,
    isLoading: isLoading || isUserLoading,
    isEmailVerificationRequired,

    // Actions
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    verifyEmail: verifyEmailMutation.mutate,
    resendVerification: resendVerificationMutation.mutate,
    logout: logoutMutation.mutate,
    logoutAll: logoutAllMutation.mutate,

    // Loading states
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isVerifyingEmail: verifyEmailMutation.isPending,
    isResendingVerification: resendVerificationMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isLoggingOutAll: logoutAllMutation.isPending,
  };
};