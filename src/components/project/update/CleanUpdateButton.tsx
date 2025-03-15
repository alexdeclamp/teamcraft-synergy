
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

interface CleanUpdateButtonProps {
  updateContent: string;
  onTextCleaned: (cleanedText: string) => void;
  model?: 'claude' | 'openai';
  onModelChange?: (model: 'claude' | 'openai') => void;
}

const CleanUpdateButton: React.FC<CleanUpdateButtonProps> = ({
  updateContent,
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
    const cleanedText = await formatText(updateContent);
    if (cleanedText) {
      onTextCleaned(cleanedText);
    }
  };

  const handleSummarizeText = async () => {
    const cleanedText = await summarizeText(updateContent);
    if (cleanedText) {
      onTextCleaned(cleanedText);
    }
  };

  const handleEnhanceText = async () => {
    const cleanedText = await enhanceText(updateContent);
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
                  disabled={isCleaning || !updateContent}
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
          <DropdownMenuItem onClick={handleFormatText} disabled={isCleaning || !updateContent}>
            Format Text (Keep All Content)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSummarizeText} disabled={isCleaning || !updateContent}>
            Summarize Text
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEnhanceText} disabled={isCleaning || !updateContent}>
            Enhance Text
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CleanUpdateButton;
