
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface TagInputProps {
  onAddTag: (tag: string) => Promise<boolean | undefined>;
}

const TagInput: React.FC<TagInputProps> = ({ onAddTag }) => {
  const [newTag, setNewTag] = useState('');

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    
    const success = await onAddTag(newTag);
    if (success) {
      setNewTag('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="relative w-full">
      <Input
        value={newTag}
        onChange={(e) => setNewTag(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add a tag..."
        className="text-xs h-8 pr-8"
      />
      <Button 
        size="sm" 
        className="absolute right-0 top-0 h-8 w-8 p-0 min-w-0" 
        onClick={handleAddTag}
        disabled={!newTag.trim()}
        title="Add Tag"
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};

export default TagInput;
