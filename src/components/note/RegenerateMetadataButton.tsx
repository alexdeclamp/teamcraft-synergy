
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
  noteId: string;
  content?: string | null;
  onSuccess?: () => void;
  model?: 'claude' | 'openai';
}

const RegenerateMetadataButton: React.FC<RegenerateMetadataButtonProps> = ({
  noteId,
  content,
  onSuccess,
  model = 'claude'
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const {
    isRegenerating,
    regenerateTitle,
    regenerateTags,
    regenerateBoth
  } = useRegenerateNoteMetadata({ 
    noteId,
    model,
    onSuccess
  });

  const handleRegenerateTitle = async () => {
    await regenerateTitle(content);
  };

  const handleRegenerateTags = async () => {
    await regenerateTags(content);
  };

  const handleRegenerateBoth = async () => {
    await regenerateBoth(content);
  };

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                disabled={isRegenerating}
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
        <DropdownMenuItem onClick={handleRegenerateTitle} disabled={isRegenerating}>
          Generate Title
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleRegenerateTags} disabled={isRegenerating}>
          Generate Tags
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleRegenerateBoth} disabled={isRegenerating}>
          Generate Both
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default RegenerateMetadataButton;
