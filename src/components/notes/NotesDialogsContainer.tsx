
import React from 'react';
import { Note } from '@/components/notes/types';
import { useNotesDialogClose } from '@/hooks/notes/useNotesDialogClose';
import { useNotesDialogHandlers } from '@/hooks/notes/useNotesDialogHandlers';
import { NotesViewDialogContainer } from './dialogs/NotesViewDialogContainer';
import { NotesCreateDialogContainer } from './dialogs/NotesCreateDialogContainer';
import { NotesEditDialogContainer } from './dialogs/NotesEditDialogContainer';

interface NotesDialogsContainerProps {
  isCreateOpen: boolean;
  isEditOpen: boolean;
  isViewOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
  setIsEditOpen: (open: boolean) => void;
  setIsViewOpen: (open: boolean) => void;
  currentNote: Note | null;
  title: string;
  content: string;
  tagInput: string;
  tags: string[];
  saving: boolean;
  aiModel: 'claude' | 'openai';
  handleCreateNote: () => void;
  handleEditNote: () => void;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  setTagInput: (input: string) => void;
  handleTagInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  addTag: () => void;
  removeTag: (tag: string) => void;
  handleRegenerateTitle: (title: string) => void;
  handleRegenerateTags: (tags: string[]) => void;
  handleRegenerateBoth: (data: { title: string; tags: string[] }) => void;
  setAiModel: (model: 'claude' | 'openai') => void;
  allTags: string[];
  formatDate?: (dateString: string) => string;
  userId?: string;
  handleCloseViewDialog: () => void;
  handleCloseCreateDialog: () => void;
  handleCloseEditDialog: () => void;
}

const NotesDialogsContainer: React.FC<NotesDialogsContainerProps> = ({
  isCreateOpen,
  isEditOpen,
  isViewOpen,
  setIsCreateOpen,
  setIsEditOpen,
  setIsViewOpen,
  currentNote,
  title,
  content,
  tagInput,
  tags,
  saving,
  aiModel,
  handleCreateNote,
  handleEditNote,
  onEdit,
  onDelete,
  setTitle,
  setContent,
  setTagInput,
  handleTagInputKeyDown,
  addTag,
  removeTag,
  handleRegenerateTitle,
  handleRegenerateTags,
  handleRegenerateBoth,
  setAiModel,
  allTags,
  formatDate,
  userId,
  handleCloseViewDialog,
  handleCloseCreateDialog,
  handleCloseEditDialog
}) => {
  const { handleCloseDialog, prepareDialogOpen } = useNotesDialogClose({
    setIsCreateOpen,
    setIsEditOpen,
    setIsViewOpen,
    resetForm: () => {
      if (handleCloseCreateDialog) handleCloseCreateDialog();
      if (handleCloseEditDialog) handleCloseEditDialog();
      if (handleCloseViewDialog) handleCloseViewDialog();
    }
  });

  const { handleOpenChange } = useNotesDialogHandlers({
    prepareDialogOpen,
    handleCloseDialog,
    setIsCreateOpen,
    setIsEditOpen,
    setIsViewOpen
  });

  return (
    <>
      <NotesViewDialogContainer
        isOpen={isViewOpen}
        setIsOpen={setIsViewOpen}
        onOpenChange={(open: boolean) => handleOpenChange(open, 'view')}
        note={currentNote}
        onEdit={onEdit}
        onDelete={onDelete}
        formatDate={formatDate}
        userId={userId}
      />
      
      <NotesCreateDialogContainer
        isOpen={isCreateOpen}
        onOpenChange={(open: boolean) => handleOpenChange(open, 'create')}
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
      
      <NotesEditDialogContainer
        isOpen={isEditOpen}
        onOpenChange={(open: boolean) => handleOpenChange(open, 'edit')}
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
    </>
  );
};

export default NotesDialogsContainer;
