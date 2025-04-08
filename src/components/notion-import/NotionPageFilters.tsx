
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search, X, RefreshCw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NotionPageFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterParentType: string | null;
  setFilterParentType: (value: string | null) => void;
  filterWorkspace: string | null;
  setFilterWorkspace: (value: string | null) => void;
  parentTypes: string[];
  workspaces: string[];
  isLoading: boolean;
  onRefresh: () => void;
  onClearFilters: () => void;
}

const NotionPageFilters: React.FC<NotionPageFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterParentType,
  setFilterParentType,
  filterWorkspace,
  setFilterWorkspace,
  parentTypes,
  workspaces,
  isLoading,
  onRefresh,
  onClearFilters
}) => {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Notion Pages</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center"
        >
          {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Refresh
        </Button>
      </div>
      
      <div className="flex flex-col gap-4">
        <div className="w-full relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search pages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border rounded-md bg-background"
          />
          {searchTerm && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0" 
              onClick={() => setSearchTerm('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="flex gap-4 flex-wrap">
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium mb-2">
              Filter by Type
            </label>
            <Select
              value={filterParentType || "all_types"}
              onValueChange={(value) => setFilterParentType(value === "all_types" ? null : value)}
            >
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_types">All types</SelectItem>
                {parentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {workspaces.length > 0 && (
            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium mb-2">
                Filter by Workspace
              </label>
              <Select
                value={filterWorkspace || "all_workspaces"}
                onValueChange={(value) => setFilterWorkspace(value === "all_workspaces" ? null : value)}
              >
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="All workspaces" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_workspaces">All workspaces</SelectItem>
                  {workspaces.map((workspace) => (
                    <SelectItem key={workspace} value={workspace}>
                      {workspace}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        {(searchTerm || filterParentType || filterWorkspace) && (
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClearFilters}
              className="text-sm"
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotionPageFilters;
