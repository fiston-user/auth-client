import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { MAX_FILE_SIZE } from '@/shared/constants';
import { DocumentsDataTable } from '../components/DocumentsDataTable';
import { CategoriesPanel } from '../components/CategoriesPanel';
import { useDocuments } from '@/application/hooks/useDocuments';

interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export function DocumentsPage() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  
  const filters = selectedCategoryId ? { categoryId: selectedCategoryId } : undefined;
  const { 
    documents,
    storageQuota,
    storageUsed,
    isLoadingDocuments,
    downloadDocument,
    deleteDocument,
    isDownloadingDocument,
    isDeletingDocument,
    uploadDocument, 
    isUploadingDocument 
  } = useDocuments(filters);

  const onDrop = useCallback(
    (
      acceptedFiles: File[],
      rejectedFiles: Array<{
        file: File;
        errors: Array<{ code: string; message: string }>;
      }>
    ) => {
      // Handle rejected files
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach(error => {
          if (error.code === 'file-too-large') {
            toast.error(`${file.name} is too large. Max size is 10MB.`);
          } else if (error.code === 'file-invalid-type') {
            toast.error(`${file.name} is not a supported file type.`);
          } else {
            toast.error(`Error with ${file.name}: ${error.message}`);
          }
        });
      });

      // Handle accepted files
      const newFiles: UploadFile[] = acceptedFiles.map(file => ({
        file,
        progress: 0,
        status: 'pending' as const,
      }));

      setUploadFiles(prev => [...prev, ...newFiles]);
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx',
      ],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: true,
  });

  const uploadFile = async (uploadFile: UploadFile, index: number) => {
    setUploadFiles(prev =>
      prev.map((f, i) =>
        i === index ? { ...f, status: 'uploading' as const } : f
      )
    );

    try {
      await uploadDocument({
        file: uploadFile.file,
        onProgress: progress => {
          setUploadFiles(prev =>
            prev.map((f, i) => (i === index ? { ...f, progress } : f))
          );
        },
      });

      setUploadFiles(prev =>
        prev.map((f, i) =>
          i === index
            ? { ...f, status: 'completed' as const, progress: 100 }
            : f
        )
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Upload failed';
      setUploadFiles(prev =>
        prev.map((f, i) =>
          i === index
            ? {
                ...f,
                status: 'error' as const,
                error: errorMessage,
              }
            : f
        )
      );
    }
  };

  const uploadAllFiles = async () => {
    const pendingFiles = uploadFiles
      .map((f, index) => ({ ...f, index }))
      .filter(f => f.status === 'pending');

    for (const fileWithIndex of pendingFiles) {
      await uploadFile(fileWithIndex, fileWithIndex.index);
    }
  };

  const removeFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearCompleted = () => {
    setUploadFiles(prev => prev.filter(f => f.status !== 'completed'));
  };

  const handleUploadClick = () => {
    setIsUploadDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsUploadDialogOpen(false);
    setUploadFiles([]);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return '🖼️';
    } else if (file.type.includes('pdf')) {
      return '📄';
    } else if (file.type.includes('document') || file.type.includes('sheet')) {
      return '📊';
    } else {
      return '📄';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const completedUploads = uploadFiles.filter(
    f => f.status === 'completed'
  ).length;
  const totalUploads = uploadFiles.length;
  const hasUploads = uploadFiles.length > 0;
  const allCompleted =
    uploadFiles.length > 0 && uploadFiles.every(f => f.status === 'completed');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Documents</h1>
        <p className="text-muted-foreground">
          Upload, manage, and organize your documents with AI-powered
          categorization.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <CategoriesPanel
            selectedCategoryId={selectedCategoryId}
            onCategorySelect={setSelectedCategoryId}
          />
        </div>

        {/* Documents Table */}
        <div className="lg:col-span-3">
          <DocumentsDataTable 
            onUpload={handleUploadClick}
            documents={documents}
            storageQuota={storageQuota}
            storageUsed={storageUsed}
            isLoadingDocuments={isLoadingDocuments}
            downloadDocument={downloadDocument}
            deleteDocument={deleteDocument}
            isDownloadingDocument={isDownloadingDocument}
            isDeletingDocument={isDeletingDocument}
          />
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-none w-[98vw] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Documents
            </DialogTitle>
            <DialogDescription>
              Drag and drop files here or click to browse. Maximum file size:
              10MB each.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-y-auto">
            {/* Drop Zone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              {isDragActive ? (
                <p className="text-lg font-medium">Drop the files here...</p>
              ) : (
                <div>
                  <p className="text-lg font-medium mb-2">
                    Drag & drop files here, or click to select
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports PDF, Word, Excel, Images, and Text files
                  </p>
                </div>
              )}
            </div>

            {/* File List */}
            {hasUploads && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                    <CardTitle className="text-lg">
                      Upload Queue ({completedUploads}/{totalUploads})
                    </CardTitle>
                    <CardDescription>
                      {allCompleted
                        ? 'All uploads completed!'
                        : 'Files ready to upload'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {completedUploads > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearCompleted}
                      >
                        Clear Completed
                      </Button>
                    )}
                    {!allCompleted && (
                      <Button
                        onClick={uploadAllFiles}
                        disabled={isUploadingDocument}
                        size="sm"
                      >
                        Upload All
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {uploadFiles.map((uploadFile, index) => (
                    <div
                      key={`${uploadFile.file.name}-${index}`}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <div className="flex-shrink-0 text-2xl">
                        {getFileIcon(uploadFile.file)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium truncate">
                            {uploadFile.file.name}
                          </p>
                          <Badge
                            variant={
                              uploadFile.status === 'completed'
                                ? 'default'
                                : uploadFile.status === 'error'
                                  ? 'destructive'
                                  : uploadFile.status === 'uploading'
                                    ? 'secondary'
                                    : 'outline'
                            }
                          >
                            {uploadFile.status === 'completed' && '✓ Complete'}
                            {uploadFile.status === 'error' && '✗ Error'}
                            {uploadFile.status === 'uploading' &&
                              'Uploading...'}
                            {uploadFile.status === 'pending' && 'Pending'}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{formatFileSize(uploadFile.file.size)}</span>
                          <span>•</span>
                          <span>{uploadFile.file.type}</span>
                        </div>

                        {uploadFile.status === 'uploading' && (
                          <Progress
                            value={uploadFile.progress}
                            className="mt-2 h-1"
                          />
                        )}

                        {uploadFile.status === 'error' && uploadFile.error && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                            <AlertCircle className="h-3 w-3" />
                            <span>{uploadFile.error}</span>
                          </div>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="flex-shrink-0 h-8 w-8 p-0 hover:bg-red-50"
                        disabled={uploadFile.status === 'uploading'}
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCloseDialog}>
                {allCompleted ? 'Done' : 'Cancel'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
