
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
    <div className="flex flex-col gap-3 h-full">
      <div className="flex justify-between items-center flex-shrink-0">
        <Label htmlFor={contentId} className="text-sm font-medium">Content</Label>
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
      
      <div className="flex-1 min-h-0">
        <Textarea 
          id={contentId} 
          placeholder="Enter note content..." 
          value={content} 
          onChange={e => onContentChange(e.target.value)} 
          className="h-full min-h-[300px] resize-none font-mono text-sm leading-relaxed"
        />
      </div>
      
      <div className="text-xs text-muted-foreground flex-shrink-0 bg-muted/30 p-2 rounded">
        <strong>Formatting tip:</strong> Use **bold**, *italic*, or __underline__ to format your text.
      </div>
    </div>
  );
};

export default NotesDialogContent;
