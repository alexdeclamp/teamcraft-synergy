
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
    console.log('🔧 Format text requested');
    setIsDropdownOpen(false);
    const cleanedText = await formatText(noteContent);
    if (cleanedText) {
      onTextCleaned(cleanedText);
    }
  };

  const handleSummarizeText = async () => {
    console.log('📝 Summarize text requested');
    setIsDropdownOpen(false);
    const cleanedText = await summarizeText(noteContent);
    if (cleanedText) {
      onTextCleaned(cleanedText);
    }
  };

  const handleEnhanceText = async () => {
    console.log('✨ Enhance text requested');
    setIsDropdownOpen(false);
    const cleanedText = await enhanceText(noteContent);
    if (cleanedText) {
      onTextCleaned(cleanedText);
    }
  };

  const hasContent = noteContent && noteContent.trim().length > 0;

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
                  disabled={isCleaning || !hasContent}
                >
                  {isCleaning ? 
                    <Loader2 className="h-4 w-4 animate-spin" /> : 
                    <Wand2 className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              {!hasContent ? 'Add content to clean text' : 'Clean Text with AI'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={handleFormatText} 
            disabled={isCleaning || !hasContent}
          >
            Format Text (Keep All Content)
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleSummarizeText} 
            disabled={isCleaning || !hasContent}
          >
            Summarize Text
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleEnhanceText} 
            disabled={isCleaning || !hasContent}
          >
            Enhance Text
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CleanTextButton;
