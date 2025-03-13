
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface UseNoteCreationProps {
  projectId?: string;
  fileName: string;
  pdfUrl: string;
}

export function useNoteCreationFromText({ projectId, fileName, pdfUrl }: UseNoteCreationProps) {
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [aiModel, setAiModel] = useState<'claude' | 'openai'>('claude');

  const handleCreateNote = (text: string, isTextSummary: boolean) => {
    const cleanFileName = fileName.replace('.pdf', '');
    const defaultTitle = isTextSummary ? `Summary of ${cleanFileName}` : `Notes from ${cleanFileName}`;
    
    const defaultContent = text;
    
    const defaultTags = ['pdf', 'document'];
    if (isTextSummary) defaultTags.push('summary');
    
    setNoteTitle(defaultTitle);
    setNoteContent(defaultContent);
    setNoteTags(defaultTags);
    setIsNoteDialogOpen(true);
  };

  const handleSubmitNote = async (userId: string) => {
    if (!noteTitle.trim() || !projectId) {
      toast.error('Please enter a title for your note');
      return;
    }
    
    try {
      setSaving(true);
      
      const sourceDocument = {
        type: 'pdf',
        url: pdfUrl,
        name: fileName
      };
      
      const { data, error } = await supabase
        .from('project_notes')
        .insert({
          title: noteTitle,
          content: noteContent,
          project_id: projectId,
          user_id: userId,
          tags: noteTags.length > 0 ? noteTags : null,
          source_document: sourceDocument
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success('Note created successfully');
      setIsNoteDialogOpen(false);
      
    } catch (error: any) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !noteTags.includes(tagInput.trim())) {
      setNoteTags([...noteTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setNoteTags(noteTags.filter(t => t !== tag));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const handleRegenerateTitle = () => {
    toast.info('Title regeneration not implemented');
  };

  const handleRegenerateTags = () => {
    toast.info('Tags regeneration not implemented');
  };

  const handleRegenerateBoth = () => {
    toast.info('Metadata regeneration not implemented');
  };

  return {
    isNoteDialogOpen,
    setIsNoteDialogOpen,
    noteTitle,
    setNoteTitle,
    noteContent,
    setNoteContent,
    noteTags,
    tagInput,
    setTagInput,
    saving,
    aiModel,
    setAiModel,
    handleCreateNote,
    handleSubmitNote,
    addTag,
    removeTag,
    handleTagInputKeyDown,
    handleRegenerateTitle,
    handleRegenerateTags,
    handleRegenerateBoth
  };
}
