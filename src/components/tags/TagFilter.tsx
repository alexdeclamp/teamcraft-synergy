
import React from 'react';
import { Search, X, ArrowUpAZ, ArrowDownAZ } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SortOption } from '@/hooks/useImageTags';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

interface TagFilterProps {
  filterText: string;
  setFilterText: (text: string) => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({
  filterText,
  setFilterText,
  sortOption,
  setSortOption
}) => {
  const handleFilterKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setFilterText('');
    }
  };

  const clearFilter = () => {
    setFilterText('');
  };

  const handleSortChange = (value: SortOption) => {
    setSortOption(value);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-1 mb-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            onKeyDown={handleFilterKeyDown}
            placeholder="Filter tags..."
            className="pl-8 pr-8 text-xs h-8"
          />
          {filterText && (
            <button 
              onClick={clearFilter}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full hover:bg-muted-foreground/10 p-0.5"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
        
        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" title="Sort Tags">
              {sortOption.includes('a-z') ? 
                <ArrowUpAZ className="h-3.5 w-3.5" /> :
                <ArrowDownAZ className="h-3.5 w-3.5" />
              }
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem 
              className={cn("text-xs", sortOption === 'a-z' && "bg-accent")}
              onClick={() => handleSortChange('a-z')}
            >
              <ArrowUpAZ className="mr-2 h-3.5 w-3.5" />
              A to Z
            </DropdownMenuItem>
            <DropdownMenuItem 
              className={cn("text-xs", sortOption === 'z-a' && "bg-accent")}
              onClick={() => handleSortChange('z-a')}
            >
              <ArrowDownAZ className="mr-2 h-3.5 w-3.5" />
              Z to A
            </DropdownMenuItem>
            <DropdownMenuItem 
              className={cn("text-xs", sortOption === 'newest' && "bg-accent")}
              onClick={() => handleSortChange('newest')}
            >
              Newest First
            </DropdownMenuItem>
            <DropdownMenuItem 
              className={cn("text-xs", sortOption === 'oldest' && "bg-accent")}
              onClick={() => handleSortChange('oldest')}
            >
              Oldest First
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TagFilter;
