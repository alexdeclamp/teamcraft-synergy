
import { useState } from 'react';

export function useNoteTags(initialTags: string[] = []) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    if (!tagInput.trim() || tags.includes(tagInput.trim())) {
      return;
    }
    setTags([...tags, tagInput.trim()]);
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const resetTags = (newTags: string[] = []) => {
    setTags(newTags);
    setTagInput('');
  };

  return {
    tags,
    setTags,
    tagInput,
    setTagInput,
    addTag,
    removeTag,
    handleTagInputKeyDown,
    resetTags
  };
}
