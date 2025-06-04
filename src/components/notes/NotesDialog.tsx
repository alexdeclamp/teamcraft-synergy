
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
      <DialogContent className="sm:max-w-[900px] md:max-w-[1000px] lg:max-w-[1200px] xl:max-w-[1400px] w-[calc(100vw-1rem)] h-[calc(100vh-1rem)] max-h-[98vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">{dialogTitle}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col p-6 gap-4 min-h-0">
          <div className="flex-shrink-0">
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
          </div>
          
          <div className="flex-1 min-h-0 overflow-hidden">
            <NotesDialogContent
              contentId={contentId}
              content={content}
              onContentChange={onContentChange}
              aiModel={aiModel}
              onModelChange={onModelChange}
            />
          </div>
          
          <div className="flex-shrink-0">
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
        </div>
        
        <DialogFooter className="flex-shrink-0 p-6 pt-4 border-t">
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
