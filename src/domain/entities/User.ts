export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly emailVerified: boolean,
    public readonly storageQuotaBytes: number,
    public readonly storageUsedBytes: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  get storageUsedPercentage(): number {
    return this.storageQuotaBytes > 0 
      ? Math.round((this.storageUsedBytes / this.storageQuotaBytes) * 100)
      : 0;
  }

  get remainingStorageBytes(): number {
    return Math.max(0, this.storageQuotaBytes - this.storageUsedBytes);
  }

  get storageUsedFormatted(): string {
    return this.formatBytes(this.storageUsedBytes);
  }

  get storageQuotaFormatted(): string {
    return this.formatBytes(this.storageQuotaBytes);
  }

  get remainingStorageFormatted(): string {
    return this.formatBytes(this.remainingStorageBytes);
  }

  canUploadFile(fileSize: number): boolean {
    return this.remainingStorageBytes >= fileSize;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static fromApiResponse(data: any): UserEntity {
    return new UserEntity(
      data.id,
      data.email,
      data.emailVerified,
      data.storageQuotaBytes,
      data.storageUsedBytes,
      new Date(data.createdAt),
      new Date(data.updatedAt)
    );
  }
}