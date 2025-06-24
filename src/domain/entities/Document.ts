import type { DocumentCategoryInfo } from '../../shared/types';

export class DocumentEntity {
  constructor(
    public readonly id: string,
    public readonly filename: string,
    public readonly originalFilename: string,
    public readonly mimeType: string,
    public readonly fileSize: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly categories: DocumentCategoryInfo[] = []
  ) {}

  get fileSizeFormatted(): string {
    return this.formatBytes(this.fileSize);
  }

  get fileExtension(): string {
    const parts = this.originalFilename.split('.');
    return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
  }

  get fileType(): 'document' | 'image' | 'text' | 'other' {
    if (this.mimeType.startsWith('image/')) return 'image';
    if (this.mimeType.startsWith('text/')) return 'text';
    if (this.mimeType.includes('pdf') || this.mimeType.includes('document') || this.mimeType.includes('sheet')) {
      return 'document';
    }
    return 'other';
  }

  get isImage(): boolean {
    return this.fileType === 'image';
  }

  get isDocument(): boolean {
    return this.fileType === 'document';
  }

  get hasCategories(): boolean {
    return this.categories.length > 0;
  }

  get aiCategories(): DocumentCategoryInfo[] {
    return this.categories.filter(cat => cat.isAiGenerated);
  }

  get manualCategories(): DocumentCategoryInfo[] {
    return this.categories.filter(cat => !cat.isAiGenerated);
  }

  get highConfidenceCategories(): DocumentCategoryInfo[] {
    return this.categories.filter(cat => (cat.confidenceScore || 0) >= 80);
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static fromApiResponse(data: any): DocumentEntity {
    return new DocumentEntity(
      data.id,
      data.filename,
      data.originalFilename,
      data.mimeType,
      data.fileSize,
      new Date(data.createdAt),
      new Date(data.updatedAt),
      data.categories || []
    );
  }
}