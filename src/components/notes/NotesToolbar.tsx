
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { SearchBar } from '@/components/ui/search-bar';
import TagFilter from './TagFilter';

interface NotesToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateNote: () => void;
  allTags: string[];
  activeTag: string | null;
  setActiveTag: (tag: string | null) => void;
}

const NotesToolbar: React.FC<NotesToolbarProps> = ({
  searchQuery,
  onSearchChange,
  onCreateNote,
  allTags,
  activeTag,
  setActiveTag
}) => {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <SearchBar
          placeholder="Search notes..."
          value={searchQuery}
          onChange={onSearchChange}
          className="flex-1"
        />
        <Button onClick={onCreateNote} className="flex items-center gap-1 shrink-0">
          <PlusCircle className="h-4 w-4" />
          New Note
        </Button>
      </div>
      
      <TagFilter 
        allTags={allTags} 
        activeTag={activeTag} 
        setActiveTag={setActiveTag} 
      />
    </div>
  );
};

export default NotesToolbar;
