
import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SortType = 'newest' | 'oldest' | 'alphabetical';

interface SortMenuProps {
  currentSort: SortType;
  onSortChange: (sort: SortType) => void;
}

const SortMenu: React.FC<SortMenuProps> = ({ currentSort, onSortChange }) => {
  const sortLabels = {
    'newest': 'Newest',
    'oldest': 'Oldest',
    'alphabetical': 'A-Z'
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button id="sort-brains" variant="outline" className="w-[140px]">
          <ArrowUpDown className="h-4 w-4 mr-2" />
          {sortLabels[currentSort]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onSortChange('newest')}>Newest</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSortChange('oldest')}>Oldest</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSortChange('alphabetical')}>Alphabetical</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SortMenu;
