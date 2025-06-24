import type { Category, DocumentCategoryInfo } from '../../shared/types';
import type { CategoryCreateFormData, CategoryUpdateFormData } from '../../shared/validators';

export interface CategoryQueryParams {
  includeSystemCategories?: boolean;
  hierarchical?: boolean;
  parentId?: string;
}

export interface DocumentCategoryAssignment {
  documentId: string;
  confidenceScore?: number;
  isAiGenerated?: boolean;
}

export interface BulkDocumentCategoryAssignment {
  documentIds: string[];
  confidenceScore?: number;
  isAiGenerated?: boolean;
  overrideExisting?: boolean;
}

export interface CategoryRepository {
  createCategory(data: CategoryCreateFormData): Promise<Category>;
  getCategories(params?: CategoryQueryParams): Promise<Category[]>;
  getCategory(id: string): Promise<Category>;
  updateCategory(id: string, data: CategoryUpdateFormData): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
  assignDocumentToCategory(categoryId: string, assignment: DocumentCategoryAssignment): Promise<void>;
  removeDocumentFromCategory(categoryId: string, documentId: string): Promise<void>;
  bulkAssignDocumentsToCategory(
    categoryId: string, 
    assignment: BulkDocumentCategoryAssignment
  ): Promise<{ success: number; failed: number }>;
  getCategoryPath(categoryId: string): Promise<Category[]>;
  getCategoryDescendants(categoryId: string, includeSelf?: boolean): Promise<Category[]>;
  getDocumentCategories(documentId: string): Promise<DocumentCategoryInfo[]>;
}