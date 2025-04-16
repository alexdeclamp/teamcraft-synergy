
import React, { useState, useEffect } from 'react';
import { useProjectNotes } from '@/hooks/useProjectNotes';
import { useNoteForm } from '@/hooks/useNoteForm';
import { useNotesSearch } from '@/hooks/notes/useNotesSearch';
import NotesDialog from './notes/NotesDialog';
import NotesViewDialog from './notes/NotesViewDialog';
import EmptyNotesList from './notes/EmptyNotesList';
import NotesLoading from './notes/NotesLoading';
import NotesToolbar from './notes/NotesToolbar';
import NotesList from './notes/NotesList';

interface ProjectNotesProps {
  projectId: string;
}

const ProjectNotes: React.FC<ProjectNotesProps> = ({ projectId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    notes,
    setNotes,
    loading,
    allTags,
    setAllTags,
    activeTag,
    setActiveTag,
    aiModel,
    setAiModel,
    handleDeleteNote,
    formatDate,
    user
  } = useProjectNotes(projectId);

  const {
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
  } = useNoteForm(projectId, notes, setNotes, allTags, setAllTags);

  const { filteredNotes } = useNotesSearch(notes, searchQuery);

  // Ensure cleanup when component unmounts - with empty dependency array to avoid infinite loop
  useEffect(() => {
    return () => {
      // Use a try-catch block to prevent errors during cleanup
      try {
        resetForm();
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    };
  }, []); // Empty dependency array means this only runs on unmount

  // Cleanup handler for when dialogs close
  const handleDialogClose = () => {
    document.body.style.overflow = '';
    document.body.classList.remove('dialog-open', 'sheet-open');
  };

  if (loading) {
    return <NotesLoading />;
  }

  if (notes.length === 0) {
    return <EmptyNotesList onCreateNote={handleOpenCreateDialog} />;
  }

  return (
    <div className="space-y-4">
      <NotesToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCreateNote={handleOpenCreateDialog}
        allTags={allTags}
        activeTag={activeTag}
        setActiveTag={setActiveTag}
      />

      <NotesList
        notes={filteredNotes}
        userId={user?.id}
        activeTag={activeTag}
        setActiveTag={setActiveTag}
        onView={openViewDialog}
        onEdit={openEditDialog}
        onDelete={handleDeleteNote}
        formatDate={formatDate}
      />

      <NotesViewDialog
        isOpen={isViewOpen}
        setIsOpen={(open) => {
          setIsViewOpen(open);
          if (!open) handleDialogClose();
        }}
        onOpenChange={(open) => {
          setIsViewOpen(open);
          if (!open) handleDialogClose();
        }}
        note={currentNote}
        onEdit={openEditDialog}
        onDelete={handleDeleteNote}
        formatDate={formatDate}
        userId={user?.id}
      />
      
      <NotesDialog
        isOpen={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) handleDialogClose();
        }}
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
        allProjectTags={allTags}
      />
      
      <NotesDialog
        isOpen={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) handleDialogClose();
        }}
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
        allProjectTags={allTags}
      />
    </div>
  );
};

export default ProjectNotes;
