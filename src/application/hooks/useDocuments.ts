import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ApiDocumentRepository } from '../../infrastructure/repositories/ApiDocumentRepository';
import { QUERY_KEYS, TOAST_DURATION } from '../../shared/constants';
import type { ApiError } from '../../shared/types';
import type { DocumentFilterOptions } from '../../domain/repositories/DocumentRepository';

const getDocumentRepository = () => new ApiDocumentRepository();

const fetchDocumentsWithCategories = async (filters?: DocumentFilterOptions) => {
  const repository = getDocumentRepository();
  
  // First get documents with optional filters
  const documentsData = await repository.getDocuments(filters);
  
  // Then fetch categories for each document
  const documentsWithCategories = await Promise.all(
    documentsData.documents.map(async (doc) => {
      try {
        // Get document categories (relationship data)
        const docCategories = await repository.getDocumentCategories(doc.id);
        
        // Get full category details for each category
        const categories = await Promise.all(
          docCategories.map(async (docCat) => {
            try {
              const category = await repository.getCategory(docCat.categoryId);
              return {
                id: category.id,
                name: category.name,
                color: category.color,
                icon: category.icon,
                confidenceScore: docCat.confidenceScore,
                isAiGenerated: docCat.isAiGenerated,
              };
            } catch (error) {
              console.warn(`Failed to fetch category ${docCat.categoryId}:`, error);
              return null;
            }
          })
        );
        
        return {
          ...doc,
          categories: categories.filter(cat => cat !== null),
        };
      } catch (error) {
        console.warn(`Failed to fetch categories for document ${doc.id}:`, error);
        return {
          ...doc,
          categories: [],
        };
      }
    })
  );
  
  return {
    ...documentsData,
    documents: documentsWithCategories,
  };
};

export const useDocuments = (filters?: DocumentFilterOptions) => {
  const queryClient = useQueryClient();

  // Get all documents and storage info with categories
  const { 
    data: documentsData, 
    isLoading: isLoadingDocuments,
    error: documentsError 
  } = useQuery({
    queryKey: [...QUERY_KEYS.DOCUMENTS.LIST, filters],
    queryFn: () => fetchDocumentsWithCategories(filters),
    retry: false,
    refetchInterval: (data) => {
      // Auto-refresh every 30 seconds if there are recent documents without categories
      const now = new Date()
      const hasRecentDocuments = data?.documents?.some(doc => {
        const docDate = new Date(doc.createdAt)
        const timeDiff = now.getTime() - docDate.getTime()
        const isRecent = timeDiff < 5 * 60 * 1000 // 5 minutes
        const hasNoCategories = !doc.categories || doc.categories.length === 0
        return isRecent && hasNoCategories
      })
      
      return hasRecentDocuments ? 30000 : false // 30 seconds or no polling
    },
  });

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (progress: number) => void }) =>
      getDocumentRepository().uploadDocument(file, onProgress),
    onSuccess: () => {
      // Force refetch to get updated categories
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENTS.LIST });
      queryClient.refetchQueries({ queryKey: QUERY_KEYS.DOCUMENTS.LIST });
      toast.success('Document uploaded successfully!', { duration: TOAST_DURATION.SUCCESS });
    },
    onError: (error: ApiError) => {
      toast.error(error.message, { duration: TOAST_DURATION.ERROR });
    },
  });

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: (documentId: string) => getDocumentRepository().deleteDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENTS.LIST });
      toast.success('Document deleted successfully!', { duration: TOAST_DURATION.SUCCESS });
    },
    onError: (error: ApiError) => {
      toast.error(error.message, { duration: TOAST_DURATION.ERROR });
    },
  });

  // Download document mutation
  const downloadDocumentMutation = useMutation({
    mutationFn: (documentId: string) => getDocumentRepository().downloadDocument(documentId),
    onSuccess: (blob: Blob, variables) => {
      // Find the document to get its filename
      const doc = documentsData?.documents.find(d => d.id === variables);
      const filename = doc?.originalFilename || 'download';
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = filename;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Document downloaded!', { duration: TOAST_DURATION.SUCCESS });
    },
    onError: (error: ApiError) => {
      toast.error(error.message, { duration: TOAST_DURATION.ERROR });
    },
  });

  return {
    // Data
    documents: documentsData?.documents || [],
    storageQuota: documentsData?.quota || 0,
    storageUsed: documentsData?.used || 0,
    totalSize: documentsData?.totalSize || 0,
    
    // Loading states
    isLoadingDocuments,
    isUploadingDocument: uploadDocumentMutation.isPending,
    isDeletingDocument: deleteDocumentMutation.isPending,
    isDownloadingDocument: downloadDocumentMutation.isPending,
    
    // Actions
    uploadDocument: uploadDocumentMutation.mutate,
    deleteDocument: deleteDocumentMutation.mutate,
    downloadDocument: downloadDocumentMutation.mutate,
    
    // Error
    documentsError,
  };
};