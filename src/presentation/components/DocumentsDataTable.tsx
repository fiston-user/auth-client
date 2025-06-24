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
  if (mimeType.startsWith('image/')) return 'bg-green-100 text-green-800'
  if (mimeType.includes('pdf')) return 'bg-red-100 text-red-800'
  if (mimeType.includes('document')) return 'bg-blue-100 text-blue-800'
  if (mimeType.includes('sheet')) return 'bg-emerald-100 text-emerald-800'
  if (mimeType.startsWith('text/')) return 'bg-gray-100 text-gray-800'
  return 'bg-slate-100 text-slate-800'
}

interface DocumentsDataTableProps {
  onUpload?: () => void
}

export function DocumentsDataTable({ onUpload }: DocumentsDataTableProps) {
  const {
    documents,
    storageQuota,
    storageUsed,
    isLoadingDocuments,
    downloadDocument,
    deleteDocument,
    isDownloadingDocument,
    isDeletingDocument,
  } = useDocuments()

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
            <div className="flex-shrink-0">
              {getFileIcon(doc.mimeType, 20)}
            </div>
            <div className="min-w-0 flex-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-sm font-medium text-gray-900 truncate cursor-help">
                      {doc.originalFilename}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{doc.originalFilename}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="text-xs text-gray-500">{doc.filename}</p>
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
          <span className="text-sm text-gray-600">
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
              <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
              <span className="text-xs text-blue-600">Processing...</span>
            </div>
          )
        }
        
        if (categories.length === 0) {
          return (
            <span className="text-xs text-gray-400">No categories</span>
          )
        }

        return (
          <div className="flex flex-wrap gap-1 max-w-48">
            {categories.slice(0, 2).map((category) => (
              <TooltipProvider key={category.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className="text-xs cursor-help"
                      style={{ borderColor: category.color, color: category.color }}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {category.name}
                      {category.isAiGenerated && (
                        <span className="ml-1 text-[10px] opacity-70">AI</span>
                      )}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p>{category.name}</p>
                      {category.confidenceScore && (
                        <p className="text-xs">Confidence: {category.confidenceScore}%</p>
                      )}
                      <p className="text-xs">
                        {category.isAiGenerated ? 'AI Generated' : 'Manual'}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
            {categories.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{categories.length - 2}
              </Badge>
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
                  <Calendar className="h-3 w-3 text-gray-400" />
                  <span className="text-sm text-gray-600">
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
                    className="h-8 w-8 p-0 hover:bg-blue-50"
                  >
                    <Download className="h-4 w-4 text-blue-600" />
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
                  className="h-8 w-8 p-0 hover:bg-gray-50"
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
                  className="cursor-pointer text-red-600 focus:text-red-600"
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
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse mb-1" />
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="h-96 bg-gray-50 rounded-lg animate-pulse" />
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