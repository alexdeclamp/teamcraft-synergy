
import React from 'react';
import { Note } from '@/components/notes/types';
import NotesDialog from './NotesDialog';
import NotesViewDialog from './NotesViewDialog';
import { useNotesDialogClose } from '@/hooks/notes/useNotesDialogClose';

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
  const { handleCloseDialog } = useNotesDialogClose({
    setIsCreateOpen,
    setIsEditOpen,
    setIsViewOpen,
    resetForm: () => {
      if (handleCloseCreateDialog) handleCloseCreateDialog();
      if (handleCloseEditDialog) handleCloseEditDialog();
      if (handleCloseViewDialog) handleCloseViewDialog();
    }
  });

  return (
    <>
      <NotesViewDialog
        isOpen={isViewOpen}
        setIsOpen={setIsViewOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseDialog('view');
          } else {
            setIsViewOpen(true);
          }
        }}
        note={currentNote}
        onEdit={onEdit}
        onDelete={onDelete}
        formatDate={formatDate}
        userId={userId}
      />
      
      <NotesDialog
        isOpen={isCreateOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseDialog('create');
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
            handleCloseDialog('edit');
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
    </>
  );
};

export default NotesDialogsContainer;
