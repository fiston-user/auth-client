import { useQuery } from '@tanstack/react-query';
import { ApiCategoryRepository } from '../../infrastructure/repositories/ApiCategoryRepository';
import type { Category } from '../../shared/types';

const categoryRepository = new ApiCategoryRepository();

export const useCategories = (hierarchical = false) => {
  return useQuery<Category[]>({
    queryKey: ['categories', { hierarchical }],
    queryFn: () => categoryRepository.getCategories({ hierarchical }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCategory = (categoryId: string) => {
  return useQuery<Category>({
    queryKey: ['category', categoryId],
    queryFn: () => categoryRepository.getCategory(categoryId),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};