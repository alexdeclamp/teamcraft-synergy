
import React from 'react';
import { BookText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SummaryOptionsProps {
  onSummarize: (model: 'claude' | 'openai') => void;
}

const SummaryOptions: React.FC<SummaryOptionsProps> = ({ onSummarize }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline"
          className="flex items-center gap-1"
        >
          <BookText className="h-4 w-4" />
          Summarize
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => onSummarize('claude')}>
          Summarize with Claude
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSummarize('openai')}>
          Summarize with OpenAI
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SummaryOptions;
