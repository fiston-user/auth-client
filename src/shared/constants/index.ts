export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER: 'auth_user',
  THEME: 'app_theme',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email',
  DASHBOARD: '/dashboard',
  DOCUMENTS: '/dashboard/documents',
  CATEGORIES: '/dashboard/categories',
  PROFILE: '/dashboard/profile',
} as const;

export const QUERY_KEYS = {
  AUTH: {
    USER: ['auth', 'user'],
    REFRESH: ['auth', 'refresh'],
  },
  DOCUMENTS: {
    LIST: ['documents'],
    DETAIL: (id: string) => ['documents', id],
    DOWNLOAD: (id: string) => ['documents', id, 'download'],
  },
  CATEGORIES: {
    LIST: ['categories'],
    DETAIL: (id: string) => ['categories', id],
    TREE: ['categories', 'tree'],
    DOCUMENT_CATEGORIES: (documentId: string) => ['categories', 'document', documentId],
  },
} as const;

export const FILE_TYPES = {
  DOCUMENT: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  TEXT: ['text/plain', 'text/csv'],
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
} as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 20,
  SORT_BY: 'createdAt',
  SORT_ORDER: 'desc' as const,
};

export const CATEGORY_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6b7280', // gray
] as const;

export const TOAST_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  INFO: 4000,
} as const;