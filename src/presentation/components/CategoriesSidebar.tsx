import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChevronDown,
  ChevronRight,
  Filter,
  FolderOpen,
  Plus,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useCategories } from '../../application/hooks/useCategories';

interface CategoriesSidebarProps {
  selectedCategoryId?: string;
  onCategorySelect: (categoryId: string | undefined) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function CategoriesSidebar({
  selectedCategoryId,
  onCategorySelect,
  isCollapsed = false,
  onToggleCollapse,
}: CategoriesSidebarProps) {
  const { data: categories = [], isLoading } = useCategories();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategoryId === categoryId) {
      onCategorySelect(undefined);
    } else {
      onCategorySelect(categoryId);
    }
  };

  const clearFilter = () => {
    onCategorySelect(undefined);
  };

  // Group categories by parent
  const rootCategories = categories.filter(cat => !cat.parentId);
  const childCategories = categories.filter(cat => cat.parentId);

  const getCategoryChildren = (parentId: string) => {
    return childCategories.filter(cat => cat.parentId === parentId);
  };

  if (isCollapsed) {
    return (
      <div className="w-16 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-4 space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <div className="flex flex-col space-y-2">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <FolderOpen className="h-4 w-4 text-primary" />
          </div>
          {selectedCategoryId && (
            <div className="w-2 h-2 bg-primary rounded-full mx-auto" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-sidebar-primary" />
            <span className="font-semibold text-sidebar-foreground">
              Categories
            </span>
          </div>
          <div className="flex items-center gap-1">
            {selectedCategoryId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilter}
                className="h-6 w-6 p-0 text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="h-6 w-6 p-0 text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <ChevronRight className="h-3 w-3 rotate-180" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Status */}
      {selectedCategoryId && (
        <div className="flex-shrink-0 px-4 py-3 bg-sidebar-accent/30 border-b border-sidebar-border">
          <div className="flex items-center gap-2 text-sm">
            <Filter className="h-3 w-3 text-sidebar-primary" />
            <span className="text-sidebar-foreground">
              Filtered by category
            </span>
          </div>
        </div>
      )}

      {/* Categories List - Scrollable */}
      <div className="flex-1 overflow-y-auto py-2 min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sidebar-primary"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8 text-sidebar-foreground/60">
            <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No categories yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {/* All Documents Option */}
            <CategoryItem
              category={{
                id: 'all',
                name: 'All Documents',
                color: '#6B7280',
                documentCount: categories.reduce(
                  (sum, cat) => sum + (cat.documentCount || 0),
                  0
                ),
              }}
              isSelected={!selectedCategoryId}
              onClick={() => onCategorySelect(undefined)}
              icon={<FolderOpen className="h-4 w-4" />}
            />

            <div className="h-px bg-sidebar-border my-2" />

            {/* Root Categories */}
            {rootCategories.map(category => {
              const children = getCategoryChildren(category.id);
              const hasChildren = children.length > 0;
              const isExpanded = expandedCategories.has(category.id);

              return (
                <div key={category.id}>
                  <CategoryItem
                    category={category}
                    isSelected={selectedCategoryId === category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    hasChildren={hasChildren}
                    isExpanded={isExpanded}
                    onToggleExpand={() => toggleExpanded(category.id)}
                  />

                  {/* Child Categories */}
                  {hasChildren && isExpanded && (
                    <div className="ml-4 mt-1 space-y-1">
                      {children.map(child => (
                        <CategoryItem
                          key={child.id}
                          category={child}
                          isSelected={selectedCategoryId === child.id}
                          onClick={() => handleCategoryClick(child.id)}
                          isChild
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-4 border-t border-sidebar-border">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent"
        >
          <Plus className="h-3 w-3 mr-2" />
          New Category
        </Button>
      </div>
    </div>
  );
}

interface CategoryItemProps {
  category: {
    id: string;
    name: string;
    color?: string;
    documentCount?: number;
  };
  isSelected: boolean;
  onClick: () => void;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  isChild?: boolean;
  icon?: React.ReactNode;
}

function CategoryItem({
  category,
  isSelected,
  onClick,
  hasChildren,
  isExpanded,
  onToggleExpand,
  isChild = false,
  icon,
}: CategoryItemProps) {
  return (
    <div
      className={`group flex items-center justify-between p-2 rounded-md cursor-pointer transition-all ${
        isSelected
          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
          : 'text-sidebar-foreground hover:bg-sidebar-accent'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            onClick={e => {
              e.stopPropagation();
              onToggleExpand?.();
            }}
            className="h-4 w-4 p-0 hover:bg-transparent"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        )}

        {!hasChildren && !icon && (
          <div className="w-4 h-4 flex items-center justify-center">
            {isChild ? (
              <div className="w-1 h-1 bg-current rounded-full opacity-50" />
            ) : (
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: category.color || '#6B7280' }}
              />
            )}
          </div>
        )}

        {icon && <div className="text-current">{icon}</div>}

        <span
          className={`truncate ${isChild ? 'text-sm' : 'text-sm font-medium'}`}
        >
          {category.name}
        </span>
      </div>

      {category.documentCount !== undefined && category.documentCount > 0 && (
        <Badge
          variant="secondary"
          className={`text-xs h-5 ${
            isSelected
              ? 'bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground'
              : 'bg-sidebar-muted text-sidebar-foreground'
          }`}
        >
          {category.documentCount}
        </Badge>
      )}
    </div>
  );
}
