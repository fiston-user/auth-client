import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FolderOpen, Loader2, Tag, X } from 'lucide-react';
import { useCategories } from '../../application/hooks/useCategories';
import type { Category } from '../../shared/types';

interface CategoriesPanelProps {
  selectedCategoryId?: string;
  onCategorySelect: (categoryId: string | undefined) => void;
}

export function CategoriesPanel({
  selectedCategoryId,
  onCategorySelect,
}: CategoriesPanelProps) {
  const { data: categories, isLoading, error } = useCategories();

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategoryId === categoryId) {
      // If already selected, deselect
      onCategorySelect(undefined);
    } else {
      onCategorySelect(categoryId);
    }
  };

  const handleClearFilter = () => {
    onCategorySelect(undefined);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Categories
          </CardTitle>
          <CardDescription>Filter documents by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">Failed to load categories</p>
        </CardContent>
      </Card>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Categories
          </CardTitle>
          <CardDescription>Filter documents by category</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No categories found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            <CardTitle>Categories</CardTitle>
          </div>
          {selectedCategoryId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilter}
              className="h-8 px-2"
            >
              <X className="h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
        <CardDescription>
          Click on a category to filter documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] overflow-y-auto">
          <div className="space-y-2">
            {categories.map(category => (
              <CategoryItem
                key={category.id}
                category={category}
                isSelected={selectedCategoryId === category.id}
                onClick={() => handleCategoryClick(category.id)}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface CategoryItemProps {
  category: Category;
  isSelected: boolean;
  onClick: () => void;
}

function CategoryItem({ category, isSelected, onClick }: CategoryItemProps) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
        isSelected
          ? 'bg-primary/10 border-primary ring-2 ring-primary/50'
          : 'bg-card border-border hover:bg-accent'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex-shrink-0">
          <Tag
            className="h-4 w-4"
            style={{ color: category.color || '#6B7280' }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground truncate">
            {category.name}
          </p>
          {category.description && (
            <p className="text-xs text-muted-foreground truncate">
              {category.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {category.documentCount !== undefined && (
          <Badge variant="secondary" className="text-xs">
            {category.documentCount}
          </Badge>
        )}
        {isSelected && <div className="w-2 h-2 bg-primary rounded-full"></div>}
      </div>
    </div>
  );
}
