
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Loader2, Tag, X } from 'lucide-react';
import RegenerateMetadataButton from '../note/RegenerateMetadataButton';
import CleanTextButton from '../note/CleanTextButton';
import NotesFormatting from './NotesFormatting';
import TagRecommendations from './TagRecommendations';

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
  
  const handleSelectRecommendedTag = (tag: string) => {
    if (!tags.includes(tag)) {
      removeTag(tag); // Remove in case it was already there (shouldn't happen, but just in case)
      onTagInputChange(tag);
      setTimeout(() => addTag(), 0);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] md:max-w-[900px] lg:max-w-[1000px] w-[calc(100vw-3rem)]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <Label htmlFor={inputId}>Title</Label>
              <RegenerateMetadataButton 
                noteContent={content} 
                onRegenerateTitle={handleRegenerateTitle} 
                onRegenerateTags={handleRegenerateTags} 
                onRegenerateBoth={handleRegenerateBoth} 
                model={aiModel} 
                onModelChange={onModelChange} 
              />
            </div>
            <Input 
              id={inputId} 
              placeholder="Enter note title" 
              value={title} 
              onChange={e => onTitleChange(e.target.value)} 
            />
          </div>
          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <Label htmlFor={contentId}>Content</Label>
              <div className="flex items-center gap-2">
                <CleanTextButton 
                  noteContent={content}
                  onTextCleaned={onContentChange}
                  model={aiModel}
                  onModelChange={onModelChange}
                />
                <NotesFormatting contentId={contentId} />
              </div>
            </div>
            <Textarea 
              id={contentId} 
              placeholder="Enter note content" 
              value={content} 
              onChange={e => onContentChange(e.target.value)} 
              className="min-h-[200px] font-mono" 
            />
            <div className="text-xs text-muted-foreground">
              Use **bold**, *italic*, or __underline__ to format your text.
            </div>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor={tagsId} className="flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" /> 
                Tags
              </Label>
              <span className="text-xs text-muted-foreground">(comma or enter to add)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Input 
                id={tagsId} 
                placeholder="Add tags..." 
                value={tagInput} 
                onChange={e => onTagInputChange(e.target.value)} 
                onKeyDown={onTagInputKeyDown} 
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addTag} 
                disabled={!tagInput.trim()}
              >
                Add
              </Button>
            </div>
            
            {/* Tag recommendations */}
            {allProjectTags.length > 0 && (
              <TagRecommendations
                availableTags={allProjectTags}
                selectedTags={tags}
                onSelectTag={handleSelectRecommendedTag}
              />
            )}
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    #{tag}
                    <button 
                      onClick={() => removeTag(tag)} 
                      className="ml-1 h-3 w-3 rounded-full flex items-center justify-center hover:bg-accent"
                    >
                      <X className="h-2 w-2" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotesDialog;
