export class CategoryEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | undefined,
    public readonly parentId: string | undefined,
    public readonly userId: string | undefined,
    public readonly color: string | undefined,
    public readonly icon: string | undefined,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly children: CategoryEntity[] = [],
    public readonly documentCount: number = 0
  ) {}

  get isSystemCategory(): boolean {
    return this.userId === null || this.userId === undefined;
  }

  get isUserCategory(): boolean {
    return !this.isSystemCategory;
  }

  get hasChildren(): boolean {
    return this.children.length > 0;
  }

  get hasParent(): boolean {
    return this.parentId !== null && this.parentId !== undefined;
  }

  get displayColor(): string {
    return this.color || '#6b7280'; // default gray
  }

  get hasDocuments(): boolean {
    return this.documentCount > 0;
  }

  get totalDocumentCount(): number {
    const childrenCount = this.children.reduce((sum, child) => sum + child.totalDocumentCount, 0);
    return this.documentCount + childrenCount;
  }

  findChild(id: string): CategoryEntity | undefined {
    for (const child of this.children) {
      if (child.id === id) return child;
      const found = child.findChild(id);
      if (found) return found;
    }
    return undefined;
  }

  getPath(): string[] {
    // This would need parent reference to build full path
    // For now, just return the name
    return [this.name];
  }

  getAllDescendants(): CategoryEntity[] {
    const descendants: CategoryEntity[] = [];
    
    for (const child of this.children) {
      descendants.push(child);
      descendants.push(...child.getAllDescendants());
    }
    
    return descendants;
  }

  canDelete(): boolean {
    return !this.hasDocuments && !this.hasChildren;
  }

  static fromApiResponse(data: any): CategoryEntity {
    const children = data.children 
      ? data.children.map((child: any) => CategoryEntity.fromApiResponse(child))
      : [];

    return new CategoryEntity(
      data.id,
      data.name,
      data.description,
      data.parentId,
      data.userId,
      data.color,
      data.icon,
      new Date(data.createdAt),
      new Date(data.updatedAt),
      children,
      data.documentCount || 0
    );
  }

  static buildTree(categories: CategoryEntity[]): CategoryEntity[] {
    const categoryMap = new Map<string, CategoryEntity>();
    const rootCategories: CategoryEntity[] = [];

    // First pass: create map of all categories
    categories.forEach(category => {
      categoryMap.set(category.id, category);
    });

    // Second pass: build tree structure
    categories.forEach(category => {
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(category);
        } else {
          // Parent not found, treat as root
          rootCategories.push(category);
        }
      } else {
        rootCategories.push(category);
      }
    });

    return rootCategories;
  }
}