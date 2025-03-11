
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Note } from '@/components/notes/types';

export function useNoteForm(projectId: string, notes: Note[], setNotes: React.Dispatch<React.SetStateAction<Note[]>>, allTags: string[], setAllTags: React.Dispatch<React.SetStateAction<string[]>>) {
  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Tag management
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

  // AI regeneration handlers
  const handleRegenerateTitle = (newTitle: string) => {
    setTitle(newTitle);
    toast.success('Title regenerated successfully');
  };

  const handleRegenerateTags = (newTags: string[]) => {
    setTags(newTags);
    toast.success('Tags regenerated successfully');
  };

  const handleRegenerateBoth = (data: { title: string; tags: string[] }) => {
    setTitle(data.title);
    setTags(data.tags);
    toast.success('Title and tags regenerated successfully');
  };

  // CRUD operations
  const handleCreateNote = async () => {
    if (!title.trim() || !projectId || !user) {
      toast.error('Please enter a title for your note');
      return;
    }
    
    try {
      setSaving(true);
      const { data, error } = await supabase
        .from('project_notes')
        .insert({
          title,
          content,
          project_id: projectId,
          user_id: user.id,
          tags: tags.length > 0 ? tags : null
        })
        .select()
        .single();
        
      if (error) throw error;
      
      const newNote: Note = {
        ...data,
        creator_name: user.user_metadata?.full_name || 'Unknown User',
        creator_avatar: user.user_metadata?.avatar_url,
        source_document: data.source_document ? {
          type: (data.source_document as any).type,
          url: (data.source_document as any).url,
          name: (data.source_document as any).name
        } : null
      };
      
      setNotes([newNote, ...notes]);
      setIsCreateOpen(false);
      resetForm();
      toast.success('Note created successfully');
      
      const newTags = tags.filter(tag => !allTags.includes(tag));
      if (newTags.length > 0) {
        setAllTags([...allTags, ...newTags]);
      }
    } catch (error: any) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
    } finally {
      setSaving(false);
    }
  };

  const handleEditNote = async () => {
    if (!title.trim() || !currentNote || !user) {
      toast.error('Please enter a title for your note');
      return;
    }
    
    try {
      setSaving(true);
      const { data, error } = await supabase
        .from('project_notes')
        .update({
          title,
          content,
          updated_at: new Date().toISOString(),
          tags: tags.length > 0 ? tags : null
        })
        .eq('id', currentNote.id)
        .eq('user_id', user.id)
        .select()
        .single();
        
      if (error) throw error;
      
      const updatedNote: Note = {
        ...data,
        creator_name: currentNote.creator_name,
        creator_avatar: currentNote.creator_avatar,
        source_document: data.source_document ? {
          type: (data.source_document as any).type,
          url: (data.source_document as any).url,
          name: (data.source_document as any).name
        } : null
      };
      
      setNotes(notes.map(note => note.id === updatedNote.id ? updatedNote : note));
      setIsEditOpen(false);
      resetForm();
      toast.success('Note updated successfully');
      
      const newTags = tags.filter(tag => !allTags.includes(tag));
      if (newTags.length > 0) {
        setAllTags([...allTags, ...newTags]);
      }
    } catch (error: any) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    } finally {
      setSaving(false);
    }
  };

  // Dialog handling
  const openEditDialog = (note: Note) => {
    setCurrentNote(note);
    setTitle(note.title);
    setContent(note.content || '');
    setTags(note.tags || []);
    setIsEditOpen(true);
  };

  const openViewDialog = (note: Note) => {
    setCurrentNote(note);
    setIsViewOpen(true);
  };

  const handleOpenCreateDialog = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setTags([]);
    setTagInput('');
    setCurrentNote(null);
  };

  return {
    isCreateOpen,
    setIsCreateOpen,
    isEditOpen,
    setIsEditOpen,
    isViewOpen,
    setIsViewOpen,
    currentNote,
    title,
    setTitle,
    content,
    setContent,
    tagInput,
    setTagInput,
    tags,
    setTags,
    saving,
    addTag,
    removeTag,
    handleTagInputKeyDown,
    handleRegenerateTitle,
    handleRegenerateTags,
    handleRegenerateBoth,
    handleCreateNote,
    handleEditNote,
    openEditDialog,
    openViewDialog,
    handleOpenCreateDialog,
    resetForm
  };
}
