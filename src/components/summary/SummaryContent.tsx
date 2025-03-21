
import React from 'react';
import { Loader2, Save, AlertCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SummaryContentProps {
  isLoading: boolean;
  summary: string;
  hasSummary: boolean;
  error?: string | null;
}

const SummaryContent: React.FC<SummaryContentProps> = ({
  isLoading,
  summary,
  hasSummary,
  error
}) => {
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Generating summary...</p>
      </div>
    );
  } 
  
  if (error) {
    return (
      <div className="p-4 bg-destructive/10 rounded-md flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        <div className="space-y-2 flex-1">
          <p className="font-medium text-destructive">
            Error generating summary
          </p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="text-sm mt-2">
            This could be due to server load or connection issues. Please try again in a few moments.
          </p>
        </div>
      </div>
    );
  }
  
  if (summary) {
    return (
      <>
        {!isMobile && (
          <div className="mb-2 px-2 text-sm text-muted-foreground flex items-center">
            <Save className="h-3 w-3 mr-1" />
            <span>Summary is saved and will be available instantly next time</span>
          </div>
        )}
        <div className="p-4 bg-accent/20 rounded-md whitespace-pre-wrap max-h-[55vh] overflow-y-auto prose prose-sm dark:prose-invert">
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
