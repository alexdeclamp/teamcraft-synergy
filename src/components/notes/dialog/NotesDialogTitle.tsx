
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RegenerateMetadataButton from '../../note/RegenerateMetadataButton';

interface NotesDialogTitleProps {
  inputId: string;
  title: string;
  content: string;
  onTitleChange: (title: string) => void;
  handleRegenerateTitle: (title: string) => void;
  handleRegenerateTags: (tags: string[]) => void;
  handleRegenerateBoth: (data: { title: string; tags: string[] }) => void;
  aiModel: 'claude' | 'openai';
  onModelChange: (model: 'claude' | 'openai') => void;
}

const NotesDialogTitle: React.FC<NotesDialogTitleProps> = ({
  inputId,
  title,
  content,
  onTitleChange,
  handleRegenerateTitle,
  handleRegenerateTags,
  handleRegenerateBoth,
  aiModel,
  onModelChange
}) => {
  return (
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
  );
};

export default NotesDialogTitle;
