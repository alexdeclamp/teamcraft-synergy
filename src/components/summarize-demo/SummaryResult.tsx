
import React from 'react';
import { Brain, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SummaryResultProps {
  summary: string;
  isGenerating: boolean;
}

const SummaryResult: React.FC<SummaryResultProps> = ({ summary, isGenerating }) => {
  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] bg-muted/30 rounded-lg">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground text-center">
          Claude is analyzing your document<br />
          This may take a moment...
        </p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] bg-muted/30 rounded-lg">
        <Brain className="h-10 w-10 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-center">
          Your AI-generated summary will appear here<br />
          Try our summarization tool to see it in action!
        </p>
      </div>
    );
  }

  // Process summary to add styling to markdown-like elements
  const formatSummary = (text: string) => {
    return text
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return <h3 key={index} className="text-lg font-bold mt-4 mb-2">{line.replace('# ', '')}</h3>;
        } else if (line.startsWith('## ')) {
          return <h4 key={index} className="text-md font-semibold mt-3 mb-1">{line.replace('## ', '')}</h4>;
        } else if (line.startsWith('• ')) {
          return <li key={index} className="ml-4 mb-1">{line.replace('• ', '')}</li>;
        } else if (line.trim() === '') {
          return <br key={index} />;
        } else {
          return <p key={index} className="mb-2">{line}</p>;
        }
      });
  };

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="text-sm">
        {formatSummary(summary)}
      </div>
    </ScrollArea>
  );
};

export default SummaryResult;
