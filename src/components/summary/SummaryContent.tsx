
import React from 'react';
import { Loader2, Save } from 'lucide-react';

interface SummaryContentProps {
  isLoading: boolean;
  summary: string;
}

const SummaryContent: React.FC<SummaryContentProps> = ({
  isLoading,
  summary
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Generating summary...</p>
      </div>
    );
  }

  if (summary) {
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

  return (
    <div className="p-4 bg-accent/10 rounded-md flex items-center justify-center h-32">
      <p className="text-muted-foreground">No summary available yet.</p>
    </div>
  );
};

export default SummaryContent;
