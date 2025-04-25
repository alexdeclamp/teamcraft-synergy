
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import CleanTextButton from '../../note/CleanTextButton';
import NotesFormatting from '../NotesFormatting';

interface NotesDialogContentProps {
  contentId: string;
  content: string;
  onContentChange: (content: string) => void;
  aiModel: 'claude' | 'openai';
  onModelChange: (model: 'claude' | 'openai') => void;
}

const NotesDialogContent: React.FC<NotesDialogContentProps> = ({
  contentId,
  content,
  onContentChange,
  aiModel,
  onModelChange
}) => {
  return (
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
  );
};

export default NotesDialogContent;
