import type { DocumentRepository } from '../../domain/repositories/DocumentRepository';
import type { Document, DocumentListResponse, BulkCategorizationResponse } from '../../shared/types';
import type { BulkCategorizationFormData } from '../../shared/validators';
import { ApiClient } from '../api/ApiClient';

export class ApiDocumentRepository implements DocumentRepository {
  private apiClient = ApiClient.getInstance();

  async uploadDocument(file: File, onProgress?: (progress: number) => void): Promise<Document> {
    const response = await this.apiClient.uploadFile<{data: Document}>('/api/v1/documents/upload', file, onProgress);
    return response.data;
  }

  async getDocuments(): Promise<DocumentListResponse> {
    const response = await this.apiClient.get<{data: DocumentListResponse}>('/api/v1/documents');
    return response.data;
  }

  async getDocumentCategories(documentId: string): Promise<Array<{ 
    id: string;
    documentId: string;
    categoryId: string;
    confidenceScore?: number;
    isAiGenerated: boolean;
    createdAt: string;
    updatedAt: string;
  }>> {
    const response = await this.apiClient.get<{data: Array<{
      id: string;
      documentId: string;
      categoryId: string;
      confidenceScore?: number;
      isAiGenerated: boolean;
      createdAt: string;
      updatedAt: string;
    }>}>(`/api/v1/categories/documents/${documentId}/categories`);
    return response.data;
  }

  async getCategory(categoryId: string): Promise<{
    id: string;
    name: string;
    description?: string;
    parentId?: string;
    userId?: string;
    color?: string;
    icon?: string;
    createdAt: string;
    updatedAt: string;
    documentCount?: number;
  }> {
    const response = await this.apiClient.get<{data: {
      id: string;
      name: string;
      description?: string;
      parentId?: string;
      userId?: string;
      color?: string;
      icon?: string;
      createdAt: string;
      updatedAt: string;
      documentCount?: number;
    }}>(`/api/v1/categories/${categoryId}`);
    return response.data;
  }

  async getDocument(id: string): Promise<Document> {
    const response = await this.apiClient.get<{data: Document}>(`/api/v1/documents/${id}`);
    return response.data;
  }

  async deleteDocument(id: string): Promise<void> {
    await this.apiClient.delete(`/api/v1/documents/${id}`);
  }

  async downloadDocument(id: string): Promise<Blob> {
    return this.apiClient.downloadFile(`/api/v1/documents/${id}/download`);
  }

  async categorizeDocument(documentId: string, forceRecategorization?: boolean): Promise<{ jobId: string }> {
    const response = await this.apiClient.post<{data: { jobId: string }}>(`/api/v1/documents/${documentId}/categorize`, {
      forceRecategorization,
    });
    return response.data;
  }

  async bulkCategorizeDocuments(data: BulkCategorizationFormData): Promise<BulkCategorizationResponse> {
    const response = await this.apiClient.post<{data: BulkCategorizationResponse}>('/api/v1/documents/categorize/bulk', data);
    return response.data;
  }
}