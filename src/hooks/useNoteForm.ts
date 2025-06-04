
import { useNoteTags } from './notes/useNoteTags';
import { useNoteDialog } from './notes/useNoteDialog';
import { useNoteContent } from './notes/useNoteContent';
import { useNoteCrud } from './notes/useNoteCrud';
import { useNoteRegeneration } from './notes/useNoteRegeneration';
import { Note } from '@/components/notes/types';

export function useNoteForm(
  projectId: string, 
  notes: Note[], 
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>, 
  allTags: string[], 
  setAllTags: React.Dispatch<React.SetStateAction<string[]>>
) {
  // Compose hooks for different functionalities
  const {
    tags,
    setTags,
    tagInput,
    setTagInput,
    addTag,
    removeTag,
    handleTagInputKeyDown,
    resetTags
  } = useNoteTags();

  const {
    isCreateOpen,
    setIsCreateOpen,
    isEditOpen,
    setIsEditOpen,
    isViewOpen,
    setIsViewOpen,
    currentNote,
    setCurrentNote,
    openCreateDialog: openDialogInternal,
    openEditDialog: openEditDialogInternal,
    openViewDialog,
    resetDialogs
  } = useNoteDialog();

  const {
    title,
    setTitle,
    content,
    setContent,
    saving,
    resetContent,
    loadNoteContent
  } = useNoteContent();

  const {
    handleRegenerateTitle: regenerateTitle,
    handleRegenerateTags: regenerateTags,
    handleRegenerateBoth: regenerateBoth
  } = useNoteRegeneration();

  const { 
    handleCreateNote: createNote,
    handleEditNote: editNote
  } = useNoteCrud(projectId, notes, setNotes, allTags, setAllTags);

  // Combined handlers that use multiple hooks
  const handleOpenCreateDialog = () => {
    resetForm();
    openDialogInternal();
  };

  const openEditDialog = (note: Note) => {
    console.log('Opening edit dialog for note:', note);
    setCurrentNote(note);
    loadNoteContent(note);
    setTags(note.tags || []);
    setIsEditOpen(true);
  };

  const handleCreateNote = async () => {
    const success = await createNote(title, content, tags);
    if (success) {
      setIsCreateOpen(false);
      resetForm();
    }
  };

  const handleEditNote = async () => {
    if (!currentNote) return;
    
    const success = await editNote(currentNote.id, title, content, tags, currentNote);
    if (success) {
      setIsEditOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    resetContent();
    resetTags();
    setCurrentNote(null);
  };

  // Wrapper regeneration handlers
  const handleRegenerateTitle = (newTitle: string) => {
    regenerateTitle(newTitle, setTitle);
  };

  const handleRegenerateTags = (newTags: string[]) => {
    regenerateTags(newTags, setTags);
  };

  const handleRegenerateBoth = (data: { title: string; tags: string[] }) => {
    regenerateBoth(data, setTitle, setTags);
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
