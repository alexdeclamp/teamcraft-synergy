
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { resetBodyStyles, forceFullDialogCleanup } from '@/utils/dialogUtils';
import NotesDialogTitle from './dialog/NotesDialogTitle';
import NotesDialogContent from './dialog/NotesDialogContent';
import NotesDialogTags from './dialog/NotesDialogTags';

interface NotesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'create' | 'edit';
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
  allProjectTags?: string[];
}

const NotesDialog: React.FC<NotesDialogProps> = ({
  isOpen,
  onOpenChange,
  type,
  title,
  content,
  tagInput,
  tags,
  saving,
  aiModel,
  onTitleChange,
  onContentChange,
  onTagInputChange,
  onTagInputKeyDown,
  addTag,
  removeTag,
  handleSubmit,
  handleRegenerateTitle,
  handleRegenerateTags,
  handleRegenerateBoth,
  onModelChange,
  allProjectTags = []
}) => {
  const dialogTitle = type === 'create' ? 'Create New Note' : 'Edit Note';
  const dialogDescription = type === 'create' 
    ? 'Add a new note to this project. Notes are visible to all project members.'
    : 'Make changes to your note.';
  const submitButtonText = type === 'create' ? 'Create Note' : 'Save Changes';
  const inputId = type === 'create' ? 'title' : 'edit-title';
  const contentId = type === 'create' ? 'content' : 'edit-content';
  const tagsId = type === 'create' ? 'tags' : 'edit-tags';
  
  useEffect(() => {
    if (!isOpen) {
      console.log(`${type} note dialog closed, cleaning up...`);
      setTimeout(forceFullDialogCleanup, 100);
    }
    
    return () => {
      if (isOpen) {
        console.log(`${type} note dialog unmounting while open, forcing cleanup`);
        forceFullDialogCleanup();
      }
    };
  }, [isOpen, type]);
  
  const handleSelectRecommendedTag = (tag: string) => {
    if (!tags.includes(tag)) {
      removeTag(tag);
      onTagInputChange(tag);
      setTimeout(() => addTag(), 0);
    }
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      console.log(`${type} note dialog closing through open change handler`);
      resetBodyStyles();
      setTimeout(() => {
        onOpenChange(open);
        forceFullDialogCleanup();
      }, 50);
    } else {
      onOpenChange(open);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[800px] md:max-w-[900px] lg:max-w-[1000px] w-[calc(100vw-3rem)]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <NotesDialogTitle
            inputId={inputId}
            title={title}
            content={content}
            onTitleChange={onTitleChange}
            handleRegenerateTitle={handleRegenerateTitle}
            handleRegenerateTags={handleRegenerateTags}
            handleRegenerateBoth={handleRegenerateBoth}
            aiModel={aiModel}
            onModelChange={onModelChange}
          />
          <NotesDialogContent
            contentId={contentId}
            content={content}
            onContentChange={onContentChange}
            aiModel={aiModel}
            onModelChange={onModelChange}
          />
          <NotesDialogTags
            tagsId={tagsId}
            tagInput={tagInput}
            tags={tags}
            onTagInputChange={onTagInputChange}
            onTagInputKeyDown={onTagInputKeyDown}
            addTag={addTag}
            removeTag={removeTag}
            allProjectTags={allProjectTags}
            handleSelectRecommendedTag={handleSelectRecommendedTag}
          />
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              console.log('Cancel button clicked, force cleaning up before close');
              forceFullDialogCleanup();
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              console.log('Submit button clicked');
              handleSubmit();
            }} 
            disabled={saving}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotesDialog;
