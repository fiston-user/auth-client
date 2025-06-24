import type { AuthRepository } from '../../domain/repositories/AuthRepository';
import type { AuthResponse, AuthTokens, User } from '../../shared/types';
import type {
  LoginFormData,
  RegisterFormData,
  EmailVerificationFormData,
} from '../../shared/validators';
import { ApiClient } from '../api/ApiClient';

export class ApiAuthRepository implements AuthRepository {
  private apiClient: ApiClient;

  constructor() {
    console.log('Initializing ApiAuthRepository');
    this.apiClient = ApiClient.getInstance();
    console.log('ApiAuthRepository initialized with apiClient:', this.apiClient);
  }

  async login(credentials: LoginFormData): Promise<AuthResponse> {
    const response = await this.apiClient.post<{ data: AuthResponse }>(
      '/api/v1/auth/login',
      credentials
    );
    return response.data;
  }

  async register(userData: RegisterFormData): Promise<AuthResponse> {
    const { confirmPassword, ...registerData } = userData;
    const response = await this.apiClient.post<{ data: AuthResponse }>(
      '/api/v1/auth/register',
      registerData
    );
    return response.data;
  }

  async logout(refreshToken: string): Promise<void> {
    await this.apiClient.post('/api/v1/auth/logout', { refreshToken });
  }

  async logoutAll(): Promise<void> {
    await this.apiClient.post('/api/v1/auth/logout-all');
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await this.apiClient.post<{ data: AuthTokens }>(
      '/api/v1/auth/refresh',
      { refreshToken }
    );
    return response.data;
  }

  async verifyEmail(data: EmailVerificationFormData): Promise<void> {
    await this.apiClient.post('/api/v1/auth/verify-email', data);
  }

  async resendVerification(email: string): Promise<void> {
    await this.apiClient.post('/api/v1/auth/resend-verification', { email });
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.apiClient.get<{ data: { user: User } }>(
      '/api/v1/auth/profile'
    );
    return response.data.user;
  }
}
