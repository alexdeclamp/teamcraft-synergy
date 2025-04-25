
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
import { resetBodyStyles, forceFullDialogCleanup } from '@/utils/dialogUtils';

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
        console.log('ProjectNotes component unmounting, cleaning up...');
        resetForm();
        forceFullDialogCleanup();
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    };
  }, []); // Empty dependency array means this only runs on unmount

  // Additional cleanup effect when dialogs change state
  useEffect(() => {
    if (!isCreateOpen && !isEditOpen && !isViewOpen) {
      console.log('All dialogs closed in ProjectNotes, running cleanup');
      setTimeout(() => {
        forceFullDialogCleanup();
        if (!isEditOpen && !isCreateOpen) {
          resetForm();
        }
      }, 150);
    }
  }, [isCreateOpen, isEditOpen, isViewOpen, resetForm]);

  // Enhanced close handlers with guaranteed cleanup
  const handleCloseViewDialog = () => {
    console.log('View dialog closing with custom handler');
    setIsViewOpen(false);
    forceFullDialogCleanup();
  };
  
  const handleCloseCreateDialog = () => {
    console.log('Create dialog closing with custom handler');
    setIsCreateOpen(false);
    forceFullDialogCleanup();
    resetForm();
  };
  
  const handleCloseEditDialog = () => {
    console.log('Edit dialog closing with custom handler');
    setIsEditOpen(false);
    forceFullDialogCleanup();
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
        onOpenChange={(open) => {
          if (!open) {
            console.log('View dialog closing through onOpenChange');
            handleCloseViewDialog();
          } else {
            setIsViewOpen(true);
          }
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
          if (!open) {
            console.log('Create dialog closing through onOpenChange');
            handleCloseCreateDialog();
          } else {
            setIsCreateOpen(true);
          }
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
          if (!open) {
            console.log('Edit dialog closing through onOpenChange');
            handleCloseEditDialog();
          } else {
            setIsEditOpen(true);
          }
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
