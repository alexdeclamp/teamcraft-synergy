import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tag, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { SortOption } from '@/hooks/useImageTags';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TagFilterProps {
  allTags?: string[];
  selectedTags?: string[];
  onTagSelect?: (tag: string) => void;
  filterText?: string;
  setFilterText?: React.Dispatch<React.SetStateAction<string>>;
  sortOption?: SortOption;
  setSortOption?: React.Dispatch<React.SetStateAction<SortOption>>;
}

const TagFilter: React.FC<TagFilterProps> = ({ 
  allTags = [], 
  selectedTags = [], 
  onTagSelect,
  filterText = '',
  setFilterText,
  sortOption = 'a-z',
  setSortOption
}) => {
  // If we have filter text controls, render filtering UI
  if (setFilterText !== undefined) {
    return (
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter tags..."
            className="pl-8 text-xs h-8"
          />
        </div>
        {setSortOption && (
          <div className="flex justify-end">
            <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
              <SelectTrigger className="w-32 h-7 text-xs">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a-z">A-Z</SelectItem>
                <SelectItem value="z-a">Z-A</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    );
  }

  // Otherwise render the original tag selection UI
  return (
    <div className="flex flex-wrap gap-1">
      {allTags.map((tag, index) => (
        <Badge 
          key={index} 
          variant={selectedTags.includes(tag) ? "default" : "outline"}
          className={cn(
            "cursor-pointer",
            selectedTags.includes(tag) 
              ? "bg-primary hover:bg-primary/80" 
              : "hover:bg-primary/10"
          )}
          onClick={() => onTagSelect && onTagSelect(tag)}
        >
          <Tag className="h-3 w-3 mr-1" />
          {tag}
        </Badge>
      ))}
    </div>
  );
};

export default TagFilter;
