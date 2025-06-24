export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  storageQuotaBytes: number;
  storageUsedBytes: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Document {
  id: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
  updatedAt: string;
  categories?: DocumentCategoryInfo[];
}

export interface DocumentListResponse {
  documents: Document[];
  totalSize: number;
  quota: number;
  used: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  userId?: string;
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
  children?: Category[];
  documentCount?: number;
}

export interface DocumentCategory {
  id: string;
  documentId: string;
  categoryId: string;
  confidenceScore?: number;
  isAiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentCategoryInfo {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  confidenceScore?: number;
  isAiGenerated: boolean;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  validation?: Record<string, string[]>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CategoryCreateRequest {
  name: string;
  description?: string;
  parentId?: string;
  color?: string;
  icon?: string;
}

export interface CategoryUpdateRequest extends Partial<CategoryCreateRequest> {}

export interface DocumentUploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  document?: Document;
}

export interface BulkCategorizationRequest {
  documentIds: string[];
  confidenceThreshold?: number;
}

export interface BulkCategorizationResponse {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
}