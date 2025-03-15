
import React from 'react';
import { SearchBar } from '@/components/ui/search-bar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Tag } from 'lucide-react';

interface ImageFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  allTags: string[];
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
  onClearFilters: () => void;
}

const ImageFilters: React.FC<ImageFiltersProps> = ({
  searchQuery,
  onSearchChange,
  allTags,
  selectedTags,
  onTagSelect,
  onClearFilters
}) => {
  const hasFilters = searchQuery || selectedTags.length > 0;
  
  return (
    <div className="space-y-3 mb-4">
      <SearchBar 
        placeholder="Search images by name..." 
        value={searchQuery}
        onChange={onSearchChange}
      />
      
      {allTags.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Filter by tags:</span>
            {hasFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs ml-auto" 
                onClick={onClearFilters}
              >
                Clear filters
              </Button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-1.5">
            {allTags.map(tag => (
              <Badge 
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => onTagSelect(tag)}
              >
                {tag}
                {selectedTags.includes(tag) && (
                  <X className="ml-1 h-3 w-3" />
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageFilters;
