
import React from 'react';
import NotesDialog from '../NotesDialog';

interface NotesCreateDialogContainerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
  tagInput: string;
  tags: string[];
  saving: boolean;
  aiModel: 'claude' | 'openai';
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onTagInputChange: (input: string) => void;
  onTagInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  addTag: () => void;
  removeTag: (tag: string) => void;
  handleSubmit: () => void;
  handleRegenerateTitle: (title: string) => void;
  handleRegenerateTags: (tags: string[]) => void;
  handleRegenerateBoth: (data: { title: string; tags: string[] }) => void;
  onModelChange: (model: 'claude' | 'openai') => void;
  allProjectTags: string[];
}

export const NotesCreateDialogContainer: React.FC<NotesCreateDialogContainerProps> = (props) => {
  return (
    <NotesDialog
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
      type="create"
      title={props.title}
      content={props.content}
      tagInput={props.tagInput}
      tags={props.tags}
      saving={props.saving}
      aiModel={props.aiModel}
      onTitleChange={props.onTitleChange}
      onContentChange={props.onContentChange}
      onTagInputChange={props.onTagInputChange}
      onTagInputKeyDown={props.onTagInputKeyDown}
      addTag={props.addTag}
      removeTag={props.removeTag}
      handleSubmit={props.handleSubmit}
      handleRegenerateTitle={props.handleRegenerateTitle}
      handleRegenerateTags={props.handleRegenerateTags}
      handleRegenerateBoth={props.handleRegenerateBoth}
      onModelChange={props.onModelChange}
      allProjectTags={props.allProjectTags}
    />
  );
};
