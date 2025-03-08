
import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
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
import { useRegenerateNoteMetadata } from '@/hooks/useRegenerateNoteMetadata';

interface RegenerateMetadataButtonProps {
  noteContent: string | null;
  onRegenerateTitle: (title: string) => void;
  onRegenerateTags: (tags: string[]) => void;
  onRegenerateBoth: (data: { title: string; tags: string[] }) => void;
  model?: 'claude' | 'openai';
  onModelChange?: (model: 'claude' | 'openai') => void;
}

const RegenerateMetadataButton: React.FC<RegenerateMetadataButtonProps> = ({
  noteContent,
  onRegenerateTitle,
  onRegenerateTags,
  onRegenerateBoth,
  model = 'claude',
  onModelChange
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const {
    isRegenerating,
    regenerateTitle,
    regenerateTags,
    regenerateBoth
  } = useRegenerateNoteMetadata({ model });

  const handleRegenerateTitle = async () => {
    const title = await regenerateTitle(noteContent);
    if (title) {
      onRegenerateTitle(title);
    }
  };

  const handleRegenerateTags = async () => {
    const tags = await regenerateTags(noteContent);
    if (tags) {
      onRegenerateTags(tags);
    }
  };

  const handleRegenerateBoth = async () => {
    const data = await regenerateBoth(noteContent);
    if (data) {
      onRegenerateBoth(data);
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
                  disabled={isRegenerating || !noteContent}
                >
                  {isRegenerating ? 
                    <Loader2 className="h-4 w-4 animate-spin" /> : 
                    <Sparkles className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>AI Generate</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleRegenerateTitle} disabled={isRegenerating || !noteContent}>
            Generate Title
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleRegenerateTags} disabled={isRegenerating || !noteContent}>
            Generate Tags
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleRegenerateBoth} disabled={isRegenerating || !noteContent}>
            Generate Both
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default RegenerateMetadataButton;
