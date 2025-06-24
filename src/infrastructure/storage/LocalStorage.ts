import { STORAGE_KEYS } from '../../shared/constants';
import type { User, AuthTokens } from '../../shared/types';

export class LocalStorageService {
  static setAccessToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  static setRefreshToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  static setTokens(tokens: AuthTokens): void {
    this.setAccessToken(tokens.accessToken);
    this.setRefreshToken(tokens.refreshToken);
  }

  static clearTokens(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  static setUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  static getUser(): User | null {
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    return userData ? JSON.parse(userData) : null;
  }

  static clearUser(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  static setTheme(theme: 'light' | 'dark' | 'system'): void {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }

  static getTheme(): 'light' | 'dark' | 'system' | null {
    return localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark' | 'system' | null;
  }

  static clearAll(): void {
    this.clearTokens();
    this.clearUser();
    // Don't clear theme preference
  }

  static isAuthenticated(): boolean {
    return !!(this.getAccessToken() && this.getRefreshToken());
  }
}