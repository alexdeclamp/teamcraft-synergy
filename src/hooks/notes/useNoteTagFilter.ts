
import { useState } from 'react';

export function useNoteTagFilter() {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  return {
    activeTag,
    setActiveTag
  };
}
