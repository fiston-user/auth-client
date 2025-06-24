import type {
  CategoryRepository,
  CategoryQueryParams,
  DocumentCategoryAssignment,
  BulkDocumentCategoryAssignment,
} from '../../domain/repositories/CategoryRepository';
import type { Category, DocumentCategoryInfo } from '../../shared/types';
import type {
  CategoryCreateFormData,
  CategoryUpdateFormData,
} from '../../shared/validators';
import { ApiClient } from '../api/ApiClient';

export class ApiCategoryRepository implements CategoryRepository {
  private apiClient = ApiClient.getInstance();

  async createCategory(data: CategoryCreateFormData): Promise<Category> {
    const response = await this.apiClient.post<{ data: Category }>(
      '/api/v1/categories',
      data
    );
    return response.data;
  }

  async getCategories(params?: CategoryQueryParams): Promise<Category[]> {
    const queryParams = new URLSearchParams();

    if (params?.includeSystemCategories !== undefined) {
      queryParams.set(
        'includeSystemCategories',
        params.includeSystemCategories.toString()
      );
    }
    if (params?.hierarchical !== undefined) {
      queryParams.set('hierarchical', params.hierarchical.toString());
    }
    if (params?.parentId) {
      queryParams.set('parentId', params.parentId);
    }

    const queryString = queryParams.toString();
    const url = queryString
      ? `/api/v1/categories?${queryString}`
      : '/api/v1/categories';

    const response = await this.apiClient.get<{
      data: { categories: Category[] };
    }>(url);
    return response.data.categories;
  }

  async getCategory(id: string): Promise<Category> {
    const response = await this.apiClient.get<{ data: Category }>(
      `/api/v1/categories/${id}`
    );
    return response.data;
  }

  async updateCategory(
    id: string,
    data: CategoryUpdateFormData
  ): Promise<Category> {
    const response = await this.apiClient.put<{ data: Category }>(
      `/api/v1/categories/${id}`,
      data
    );
    return response.data;
  }

  async deleteCategory(id: string): Promise<void> {
    await this.apiClient.delete(`/api/v1/categories/${id}`);
  }

  async assignDocumentToCategory(
    categoryId: string,
    assignment: DocumentCategoryAssignment
  ): Promise<void> {
    await this.apiClient.post(
      `/api/v1/categories/${categoryId}/documents`,
      assignment
    );
  }

  async removeDocumentFromCategory(
    categoryId: string,
    documentId: string
  ): Promise<void> {
    await this.apiClient.delete(
      `/api/v1/categories/${categoryId}/documents/${documentId}`
    );
  }

  async bulkAssignDocumentsToCategory(
    categoryId: string,
    assignment: BulkDocumentCategoryAssignment
  ): Promise<{ success: number; failed: number }> {
    const response = await this.apiClient.post<{
      data: { success: number; failed: number };
    }>(`/api/v1/categories/${categoryId}/documents/bulk`, assignment);
    return response.data;
  }

  async getCategoryPath(categoryId: string): Promise<Category[]> {
    const response = await this.apiClient.get<{ data: Category[] }>(
      `/api/v1/categories/${categoryId}/path`
    );
    return response.data;
  }

  async getCategoryDescendants(
    categoryId: string,
    includeSelf?: boolean
  ): Promise<Category[]> {
    const params = includeSelf ? '?includeSelf=true' : '';
    const response = await this.apiClient.get<{ data: Category[] }>(
      `/api/v1/categories/${categoryId}/descendants${params}`
    );
    return response.data;
  }

  async getDocumentCategories(
    documentId: string
  ): Promise<DocumentCategoryInfo[]> {
    const response = await this.apiClient.get<{ data: DocumentCategoryInfo[] }>(
      `/api/v1/categories/documents/${documentId}/categories`
    );
    return response.data;
  }
}
