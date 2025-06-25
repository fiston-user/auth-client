import type { Document, DocumentListResponse, BulkCategorizationResponse } from '../../shared/types';
import type { BulkCategorizationFormData } from '../../shared/validators';

export interface DocumentFilterOptions {
  categoryId?: string;
  categoryIds?: string[];
  includeSubcategories?: boolean;
  isAiCategorized?: boolean;
  minConfidenceScore?: number;
}

export interface DocumentRepository {
  uploadDocument(file: File, onProgress?: (progress: number) => void): Promise<Document>;
  getDocuments(filters?: DocumentFilterOptions): Promise<DocumentListResponse>;
  getDocument(id: string): Promise<Document>;
  deleteDocument(id: string): Promise<void>;
  downloadDocument(id: string): Promise<Blob>;
  categorizeDocument(documentId: string, forceRecategorization?: boolean): Promise<{ jobId: string }>;
  bulkCategorizeDocuments(data: BulkCategorizationFormData): Promise<BulkCategorizationResponse>;
  getDocumentCategories(documentId: string): Promise<Array<{ 
    id: string;
    documentId: string;
    categoryId: string;
    confidenceScore?: number;
    isAiGenerated: boolean;
    createdAt: string;
    updatedAt: string;
  }>>;
  getCategory(categoryId: string): Promise<{
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
  }>;
}