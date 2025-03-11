
import { useState } from 'react';
import { Note } from '@/components/notes/types';

export function useNoteContent(initialNote: Note | null = null) {
  const [title, setTitle] = useState(initialNote?.title || '');
  const [content, setContent] = useState(initialNote?.content || '');
  const [saving, setSaving] = useState(false);

  const resetContent = () => {
    setTitle('');
    setContent('');
  };

  const loadNoteContent = (note: Note) => {
    setTitle(note.title);
    setContent(note.content || '');
  };

  return {
    title,
    setTitle,
    content,
    setContent,
    saving,
    setSaving,
    resetContent,
    loadNoteContent
  };
}
