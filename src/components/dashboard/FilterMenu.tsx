
import React from 'react';
import { Filter, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type FilterType = 'all' | 'owned' | 'member' | 'favorites';

interface FilterMenuProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const FilterMenu: React.FC<FilterMenuProps> = ({ currentFilter, onFilterChange }) => {
  const filterLabels = {
    'all': 'All',
    'owned': 'Owned',
    'member': 'Member',
    'favorites': 'Favorites'
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button id="filter-brains" variant="outline" className="w-full sm:w-[130px] h-10">
          <Filter className="h-4 w-4 mr-2" />
          <span className="truncate">{filterLabels[currentFilter]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Filter by</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onFilterChange('all')}>All</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFilterChange('owned')}>Owned</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFilterChange('member')}>Member</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onFilterChange('favorites')}>
          <Star className="h-4 w-4 mr-2" />
          Favorites
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterMenu;
