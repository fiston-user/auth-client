import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import {
  MoreHorizontal,
  Download,
  Trash2,
  FileText,
  Image,
  File,
  Eye,
  Tag,
  Calendar,
  HardDrive,
  Upload,
  Loader2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DataTable } from "@/components/ui/data-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useDocuments } from "../../application/hooks/useDocuments"
import type { Document } from "../../shared/types"

// Helper functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileIcon = (mimeType: string, size: number = 16) => {
  const className = `h-${size/4} w-${size/4}`
  
  if (mimeType.startsWith('image/')) {
    return <Image className={className} />
  } else if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('sheet')) {
    return <FileText className={className} />
  } else {
    return <File className={className} />
  }
}

const getFileTypeColor = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
  if (mimeType.includes('pdf')) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  if (mimeType.includes('document')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
  if (mimeType.includes('sheet')) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  if (mimeType.startsWith('text/')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
  return 'bg-muted/50 text-muted-foreground'
}

interface DocumentsDataTableProps {
  onUpload?: () => void;
  documents?: any[];
  storageQuota?: number;
  storageUsed?: number;
  isLoadingDocuments?: boolean;
  downloadDocument?: (id: string) => void;
  deleteDocument?: (id: string) => void;
  isDownloadingDocument?: boolean;
  isDeletingDocument?: boolean;
}

export function DocumentsDataTable({ 
  onUpload,
  documents: propDocuments,
  storageQuota: propStorageQuota,
  storageUsed: propStorageUsed,
  isLoadingDocuments: propIsLoadingDocuments,
  downloadDocument: propDownloadDocument,
  deleteDocument: propDeleteDocument,
  isDownloadingDocument: propIsDownloadingDocument,
  isDeletingDocument: propIsDeletingDocument,
}: DocumentsDataTableProps) {
  // Use fallback hook if props are not provided (for backward compatibility)
  const fallbackData = useDocuments();
  
  const documents = propDocuments ?? fallbackData.documents;
  const storageQuota = propStorageQuota ?? fallbackData.storageQuota;
  const storageUsed = propStorageUsed ?? fallbackData.storageUsed;
  const isLoadingDocuments = propIsLoadingDocuments ?? fallbackData.isLoadingDocuments;
  const downloadDocument = propDownloadDocument ?? fallbackData.downloadDocument;
  const deleteDocument = propDeleteDocument ?? fallbackData.deleteDocument;
  const isDownloadingDocument = propIsDownloadingDocument ?? fallbackData.isDownloadingDocument;
  const isDeletingDocument = propIsDeletingDocument ?? fallbackData.isDeletingDocument;

  const handleDownload = (documentId: string) => {
    downloadDocument(documentId)
  }

  const handleDelete = (documentId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      deleteDocument(documentId)
    }
  }

  const columns: ColumnDef<Document>[] = [
    {
      accessorKey: "filename",
      header: "Document",
      cell: ({ row }) => {
        const doc = row.original
        return (
          <div className="flex items-center space-x-3 min-w-0">
            <div className="flex-shrink-0 p-2 rounded-lg bg-muted/30">
              {getFileIcon(doc.mimeType, 20)}
            </div>
            <div className="min-w-0 flex-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-sm font-medium text-foreground truncate cursor-help hover:text-primary transition-colors">
                      {doc.originalFilename}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{doc.originalFilename}</p>
                    <p className="text-xs text-muted-foreground mt-1">Internal: {doc.filename}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">{doc.filename}</p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "mimeType",
      header: "Type",
      cell: ({ row }) => {
        const mimeType = row.getValue("mimeType") as string
        const fileExtension = row.original.originalFilename.split('.').pop()?.toUpperCase()
        
        return (
          <Badge variant="secondary" className={getFileTypeColor(mimeType)}>
            {fileExtension || 'FILE'}
          </Badge>
        )
      },
    },
    {
      accessorKey: "fileSize",
      header: "Size",
      cell: ({ getValue }) => {
        const size = getValue() as number
        return (
          <span className="text-sm text-muted-foreground">
            {formatFileSize(size)}
          </span>
        )
      },
    },
    {
      accessorKey: "categories",
      header: "Categories",
      cell: ({ row }) => {
        const categories = row.original.categories || []
        const createdAt = new Date(row.original.createdAt)
        const now = new Date()
        const timeDiff = now.getTime() - createdAt.getTime()
        const isRecent = timeDiff < 5 * 60 * 1000 // 5 minutes
        
        // Show loading state for recently uploaded documents without categories
        if (categories.length === 0 && isRecent) {
          return (
            <div className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              <span className="text-xs text-primary">Processing...</span>
            </div>
          )
        }
        
        if (categories.length === 0) {
          return (
            <span className="text-xs text-muted-foreground">No categories</span>
          )
        }

        return (
          <div className="flex flex-wrap gap-1.5 max-w-52">
            {categories.slice(0, 2).map((category) => (
              <TooltipProvider key={category.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-help transition-all hover:scale-105 border"
                      style={{ 
                        backgroundColor: `${category.color}15`,
                        borderColor: `${category.color}40`,
                        color: category.color 
                      }}
                    >
                      <div 
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="truncate max-w-[80px]">{category.name}</span>
                      {category.isAiGenerated && (
                        <div className="flex items-center gap-1">
                          <div className="w-0.5 h-3 bg-current opacity-30 rounded-full" />
                          <span className="text-[10px] font-bold opacity-80">AI</span>
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      {category.confidenceScore && (
                        <div className="text-xs text-muted-foreground">
                          Confidence: {category.confidenceScore}%
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded-full ${
                          category.isAiGenerated 
                            ? 'bg-primary/10 text-primary' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {category.isAiGenerated ? '🤖 AI Generated' : '👤 Manual'}
                        </span>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
            {categories.length > 2 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge 
                      variant="secondary" 
                      className="text-xs cursor-help hover:bg-accent transition-colors"
                    >
                      +{categories.length - 2}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <div className="space-y-1">
                      <p className="font-medium">Additional Categories:</p>
                      {categories.slice(2).map((cat, index) => (
                        <div key={cat.id} className="flex items-center gap-2 text-xs">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span>{cat.name}</span>
                        </div>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Uploaded",
      cell: ({ getValue }) => {
        const date = getValue() as string
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-1 cursor-help">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(date), 'MMM dd, yyyy')}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{format(new Date(date), 'PPpp')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const document = row.original

        return (
          <div className="flex items-center justify-end space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(document.id)}
                    disabled={isDownloadingDocument}
                    className="h-8 w-8 p-0 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400 transition-all"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground transition-all"
                >
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(document.id)}
                  className="cursor-pointer"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Copy ID
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDownload(document.id)}
                  disabled={isDownloadingDocument}
                  className="cursor-pointer"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(document.id)}
                  disabled={isDeletingDocument}
                  className="cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 transition-colors"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  const storagePercentage = storageQuota > 0 ? (storageUsed / storageQuota) * 100 : 0

  if (isLoadingDocuments) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                <div className="h-4 w-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-6 w-16 bg-muted rounded animate-pulse mb-1" />
                <div className="h-3 w-24 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="h-96 bg-muted rounded-lg animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Storage Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">
              {documents.length === 1 ? 'document' : 'documents'} stored
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(storageUsed)}</div>
            <p className="text-xs text-muted-foreground">
              of {formatFileSize(storageQuota)} ({storagePercentage.toFixed(1)}%)
            </p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  storagePercentage > 90 
                    ? 'bg-red-500' 
                    : storagePercentage > 75 
                    ? 'bg-yellow-500' 
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(storagePercentage, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upload New</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button 
              onClick={onUpload}
              className="w-full"
              size="sm"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Max 10MB per file
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>
            Manage your uploaded documents, download files, and view categorization details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={documents}
            searchPlaceholder="Search documents..."
            searchKey="filename"
          />
        </CardContent>
      </Card>
    </div>
  )
}