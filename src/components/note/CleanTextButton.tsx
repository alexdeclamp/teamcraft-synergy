
import React, { useState } from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCleanNoteText } from '@/hooks/useCleanNoteText';

interface CleanTextButtonProps {
  noteContent: string | null;
  onTextCleaned: (cleanedText: string) => void;
  model?: 'claude' | 'openai';
  onModelChange?: (model: 'claude' | 'openai') => void;
}

const CleanTextButton: React.FC<CleanTextButtonProps> = ({
  noteContent,
  onTextCleaned,
  model = 'claude',
  onModelChange
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const {
    isCleaning,
    formatText,
    summarizeText,
    enhanceText
  } = useCleanNoteText({ model });

  const handleFormatText = async () => {
    const cleanedText = await formatText(noteContent);
    if (cleanedText) {
      onTextCleaned(cleanedText);
    }
  };

  const handleSummarizeText = async () => {
    const cleanedText = await summarizeText(noteContent);
    if (cleanedText) {
      onTextCleaned(cleanedText);
    }
  };

  const handleEnhanceText = async () => {
    const cleanedText = await enhanceText(noteContent);
    if (cleanedText) {
      onTextCleaned(cleanedText);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {onModelChange && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              {model === 'claude' ? 'Claude' : 'OpenAI'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onModelChange('claude')}>
              Claude
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onModelChange('openai')}>
              OpenAI (GPT-4o mini)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  disabled={isCleaning || !noteContent}
                >
                  {isCleaning ? 
                    <Loader2 className="h-4 w-4 animate-spin" /> : 
                    <Wand2 className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Clean Text</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleFormatText} disabled={isCleaning || !noteContent}>
            Format Text (Keep All Content)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSummarizeText} disabled={isCleaning || !noteContent}>
            Summarize Text
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEnhanceText} disabled={isCleaning || !noteContent}>
            Enhance Text
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CleanTextButton;
