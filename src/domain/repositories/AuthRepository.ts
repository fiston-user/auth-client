import type { AuthResponse, AuthTokens, User } from '../../shared/types';
import type { LoginFormData, RegisterFormData, EmailVerificationFormData } from '../../shared/validators';

export interface AuthRepository {
  login(credentials: LoginFormData): Promise<AuthResponse>;
  register(userData: RegisterFormData): Promise<AuthResponse>;
  logout(refreshToken: string): Promise<void>;
  logoutAll(): Promise<void>;
  refreshToken(refreshToken: string): Promise<AuthTokens>;
  verifyEmail(data: EmailVerificationFormData): Promise<void>;
  resendVerification(email: string): Promise<void>;
  getCurrentUser(): Promise<User>;
}