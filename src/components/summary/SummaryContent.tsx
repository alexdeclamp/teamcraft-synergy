
import React from 'react';
import { Loader2, Save } from 'lucide-react';

interface SummaryContentProps {
  isLoading: boolean;
  summary: string;
  hasSummary: boolean;
}

const SummaryContent: React.FC<SummaryContentProps> = ({
  isLoading,
  summary,
  hasSummary
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Generating summary...</p>
      </div>
    );
  }

  // Only show the summary content if we explicitly know we have a summary
  if (hasSummary && summary.trim() !== '') {
    return (
      <>
        <div className="mb-2 px-2 text-sm text-muted-foreground flex items-center">
          <Save className="h-3 w-3 mr-1" />
          <span>Summary is saved and will be available instantly next time</span>
        </div>
        <div className="p-4 bg-accent/20 rounded-md whitespace-pre-wrap max-h-[50vh] overflow-y-auto">
          {summary}
        </div>
      </>
    );
  }

  // Default "no summary" state
  return (
    <div className="p-4 bg-accent/10 rounded-md flex items-center justify-center h-32">
      <p className="text-muted-foreground">No summary available yet.</p>
    </div>
  );
};

export default SummaryContent;
