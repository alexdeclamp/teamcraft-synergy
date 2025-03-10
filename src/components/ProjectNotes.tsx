
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

// Import our new components
import NotesDialog from './notes/NotesDialog';
import NotesCard from './notes/NotesCard';
import TagFilter from './notes/TagFilter';
import EmptyNotesList from './notes/EmptyNotesList';
import NotesLoading from './notes/NotesLoading';
import NotesViewDialog from './notes/NotesViewDialog';
import { Note } from './notes/types';

interface ProjectNotesProps {
  projectId: string;
}

const ProjectNotes: React.FC<ProjectNotesProps> = ({ projectId }) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [aiModel, setAiModel] = useState<'claude' | 'openai'>('claude');

  useEffect(() => {
    fetchNotes();
  }, [projectId, activeTag]);

  const fetchNotes = async () => {
    if (!projectId || !user) return;
    try {
      setLoading(true);
      let query = supabase.from('project_notes').select('*').eq('project_id', projectId);
      if (activeTag) {
        query = query.contains('tags', [activeTag]);
      }
      const { data: notesData, error: notesError } = await query.order('updated_at', {
        ascending: false
      });
      
      if (notesError) throw notesError;
      
      const userIds = [...new Set(notesData?.map(note => note.user_id) || [])];
      const tagSet = new Set<string>();
      
      notesData?.forEach(note => {
        if (note.tags && Array.isArray(note.tags)) {
          note.tags.forEach(tag => tagSet.add(tag));
        }
      });
      
      setAllTags(Array.from(tagSet));
      
      let profiles: any[] = [];
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);
          
        if (profilesError) throw profilesError;
        profiles = profilesData || [];
      }
      
      const notesWithCreators = notesData?.map(note => {
        const creator = profiles.find(profile => profile.id === note.user_id);
        return {
          ...note,
          creator_name: creator?.full_name || 'Unknown User',
          creator_avatar: creator?.avatar_url
        };
      }) || [];
      
      setNotes(notesWithCreators);
    } catch (error: any) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

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
      
      const newNote = {
        ...data,
        creator_name: user.user_metadata?.full_name || 'Unknown User',
        creator_avatar: user.user_metadata?.avatar_url
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
      
      const updatedNote = {
        ...data,
        creator_name: currentNote.creator_name,
        creator_avatar: currentNote.creator_avatar
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

  const handleDeleteNote = async (noteId: string) => {
    if (!noteId || !user) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this note?');
    if (!confirmed) return;
    
    try {
      const { error } = await supabase
        .from('project_notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setNotes(notes.filter(note => note.id !== noteId));
      toast.success('Note deleted successfully');
      
      const remainingTags = new Set<string>();
      notes
        .filter(note => note.id !== noteId)
        .forEach(note => {
          if (note.tags) {
            note.tags.forEach(tag => remainingTags.add(tag));
          }
        });
        
      setAllTags(Array.from(remainingTags));
    } catch (error: any) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <Button onClick={handleOpenCreateDialog} className="flex items-center gap-1">
          <PlusCircle className="h-4 w-4" />
          New Note
        </Button>
      </div>

      <TagFilter 
        allTags={allTags} 
        activeTag={activeTag} 
        setActiveTag={setActiveTag} 
      />

      {loading ? (
        <NotesLoading />
      ) : notes.length === 0 ? (
        <EmptyNotesList onCreateNote={handleOpenCreateDialog} />
      ) : (
        <div className="space-y-2">
          {notes.map(note => (
            <NotesCard
              key={note.id}
              note={note}
              userId={user?.id}
              activeTag={activeTag}
              setActiveTag={setActiveTag}
              onView={openViewDialog}
              onEdit={openEditDialog}
              onDelete={handleDeleteNote}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}

      <NotesViewDialog
        isOpen={isViewOpen}
        onOpenChange={setIsViewOpen}
        note={currentNote}
        onEdit={openEditDialog}
        onDelete={handleDeleteNote}
        formatDate={formatDate}
        userId={user?.id}
      />
      
      <NotesDialog
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        type="create"
        title={title}
        content={content}
        tagInput={tagInput}
        tags={tags}
        saving={saving}
        aiModel={aiModel}
        onTitleChange={setTitle}
        onContentChange={setContent}
        onTagInputChange={setTagInput}
        onTagInputKeyDown={handleTagInputKeyDown}
        addTag={addTag}
        removeTag={removeTag}
        handleSubmit={handleCreateNote}
        handleRegenerateTitle={handleRegenerateTitle}
        handleRegenerateTags={handleRegenerateTags}
        handleRegenerateBoth={handleRegenerateBoth}
        onModelChange={setAiModel}
      />
      
      <NotesDialog
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        type="edit"
        title={title}
        content={content}
        tagInput={tagInput}
        tags={tags}
        saving={saving}
        aiModel={aiModel}
        onTitleChange={setTitle}
        onContentChange={setContent}
        onTagInputChange={setTagInput}
        onTagInputKeyDown={handleTagInputKeyDown}
        addTag={addTag}
        removeTag={removeTag}
        handleSubmit={handleEditNote}
        handleRegenerateTitle={handleRegenerateTitle}
        handleRegenerateTags={handleRegenerateTags}
        handleRegenerateBoth={handleRegenerateBoth}
        onModelChange={setAiModel}
      />
    </div>
  );
};

export default ProjectNotes;
