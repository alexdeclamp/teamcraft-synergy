
import React from 'react';
import SearchBar from './SearchBar';
import FilterMenu from './FilterMenu';
import SortMenu from './SortMenu';

interface DashboardToolbarProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filter: 'all' | 'owned' | 'member' | 'favorites';
  onFilterChange: (filter: 'all' | 'owned' | 'member' | 'favorites') => void;
  sortOrder: 'newest' | 'oldest' | 'alphabetical';
  onSortChange: (order: 'newest' | 'oldest' | 'alphabetical') => void;
}

const DashboardToolbar: React.FC<DashboardToolbarProps> = ({
  searchTerm,
  onSearchChange,
  filter,
  onFilterChange,
  sortOrder,
  onSortChange
}) => {
  return (
    <div className="mb-8 flex flex-col sm:flex-row gap-4">
      <SearchBar value={searchTerm} onChange={onSearchChange} />
      
      <div className="flex gap-3">
        <FilterMenu currentFilter={filter} onFilterChange={onFilterChange} />
        <SortMenu currentSort={sortOrder} onSortChange={onSortChange} />
      </div>
    </div>
  );
};

export default DashboardToolbar;
