
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tag, X } from 'lucide-react';
import TagRecommendations from '../TagRecommendations';

interface NotesDialogTagsProps {
  tagsId: string;
  tagInput: string;
  tags: string[];
  onTagInputChange: (input: string) => void;
  onTagInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  addTag: () => void;
  removeTag: (tag: string) => void;
  allProjectTags?: string[];
  handleSelectRecommendedTag: (tag: string) => void;
}

const NotesDialogTags: React.FC<NotesDialogTagsProps> = ({
  tagsId,
  tagInput,
  tags,
  onTagInputChange,
  onTagInputKeyDown,
  addTag,
  removeTag,
  allProjectTags = [],
  handleSelectRecommendedTag
}) => {
  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={tagsId} className="flex items-center gap-1">
          <Tag className="h-3.5 w-3.5" /> 
          Tags
        </Label>
        <span className="text-xs text-muted-foreground">(comma or enter to add)</span>
      </div>
      <div className="flex items-center space-x-2">
        <Input 
          id={tagsId} 
          placeholder="Add tags..." 
          value={tagInput} 
          onChange={e => onTagInputChange(e.target.value)} 
          onKeyDown={onTagInputKeyDown} 
        />
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={addTag} 
          disabled={!tagInput.trim()}
        >
          Add
        </Button>
      </div>
      
      {allProjectTags.length > 0 && (
        <TagRecommendations
          availableTags={allProjectTags}
          selectedTags={tags}
          onSelectTag={handleSelectRecommendedTag}
        />
      )}
      
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {tags.map(tag => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              #{tag}
              <button 
                onClick={() => removeTag(tag)} 
                className="ml-1 h-3 w-3 rounded-full flex items-center justify-center hover:bg-accent"
              >
                <X className="h-2 w-2" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesDialogTags;
