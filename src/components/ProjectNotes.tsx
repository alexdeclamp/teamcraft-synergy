
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
import { resetBodyStyles } from '@/utils/dialogUtils';

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

  // Ensure cleanup when component unmounts
  useEffect(() => {
    return () => {
      try {
        resetForm();
        resetBodyStyles();
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    };
  }, []); // Empty dependency array means this only runs on unmount

  // Enhanced close handlers with guaranteed cleanup
  const handleCloseViewDialog = () => {
    setIsViewOpen(false);
    resetBodyStyles();
  };
  
  const handleCloseCreateDialog = () => {
    setIsCreateOpen(false);
    resetBodyStyles();
    resetForm();
  };
  
  const handleCloseEditDialog = () => {
    setIsEditOpen(false);
    resetBodyStyles();
    resetForm();
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
        setIsOpen={setIsViewOpen}
        onOpenChange={setIsViewOpen}
        note={currentNote}
        onEdit={openEditDialog}
        onDelete={handleDeleteNote}
        formatDate={formatDate}
        userId={user?.id}
      />
      
      <NotesDialog
        isOpen={isCreateOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseCreateDialog();
          else setIsCreateOpen(true);
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
          if (!open) handleCloseEditDialog();
          else setIsEditOpen(true);
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
