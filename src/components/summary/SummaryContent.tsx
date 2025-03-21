
import React from 'react';
import { Loader2, Save, AlertCircle, ZapOff } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  
  const isApiLimitError = error?.includes('Daily API limit reached');

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
        {isApiLimitError ? (
          <ZapOff className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        )}
        <div className="space-y-2 flex-1">
          <p className="font-medium text-destructive">
            {isApiLimitError ? 'Daily AI API Limit Reached' : 'Error generating summary'}
          </p>
          <p className="text-sm text-muted-foreground">{error}</p>
          
          {isApiLimitError ? (
            <div className="pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/subscription')}
                className="w-full sm:w-auto mt-1"
              >
                Upgrade to Pro for unlimited API calls
              </Button>
            </div>
          ) : (
            <p className="text-sm mt-2">
              This could be due to server load or connection issues. Please try again in a few moments.
            </p>
          )}
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
