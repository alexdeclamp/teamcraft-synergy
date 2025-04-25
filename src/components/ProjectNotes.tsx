
import React from 'react';
import { useProjectNotes } from '@/hooks/useProjectNotes';
import { useNoteForm } from '@/hooks/useNoteForm';
import { useNotesSearch } from '@/hooks/notes/useNotesSearch';
import { useNotesDialogCleanup } from '@/hooks/notes/useNotesDialogCleanup';
import EmptyNotesList from './notes/EmptyNotesList';
import NotesLoading from './notes/NotesLoading';
import NotesToolbar from './notes/NotesToolbar';
import NotesList from './notes/NotesList';
import NotesDialogsContainer from './notes/NotesDialogsContainer';

interface ProjectNotesProps {
  projectId: string;
}

const ProjectNotes: React.FC<ProjectNotesProps> = ({ projectId }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  
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

  const {
    handleCloseViewDialog,
    handleCloseCreateDialog,
    handleCloseEditDialog
  } = useNotesDialogCleanup({
    isCreateOpen,
    isEditOpen,
    isViewOpen,
    resetForm
  });

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

      <NotesDialogsContainer
        isCreateOpen={isCreateOpen}
        isEditOpen={isEditOpen}
        isViewOpen={isViewOpen}
        setIsCreateOpen={setIsCreateOpen}
        setIsEditOpen={setIsEditOpen}
        setIsViewOpen={setIsViewOpen}
        currentNote={currentNote}
        title={title}
        content={content}
        tagInput={tagInput}
        tags={tags}
        saving={saving}
        aiModel={aiModel}
        handleCreateNote={handleCreateNote}
        handleEditNote={handleEditNote}
        onEdit={openEditDialog}
        onDelete={handleDeleteNote}
        setTitle={setTitle}
        setContent={setContent}
        setTagInput={setTagInput}
        handleTagInputKeyDown={handleTagInputKeyDown}
        addTag={addTag}
        removeTag={removeTag}
        handleRegenerateTitle={handleRegenerateTitle}
        handleRegenerateTags={handleRegenerateTags}
        handleRegenerateBoth={handleRegenerateBoth}
        setAiModel={setAiModel}
        allTags={allTags}
        formatDate={formatDate}
        userId={user?.id}
        handleCloseViewDialog={handleCloseViewDialog}
        handleCloseCreateDialog={handleCloseCreateDialog}
        handleCloseEditDialog={handleCloseEditDialog}
      />
    </div>
  );
};

export default ProjectNotes;
