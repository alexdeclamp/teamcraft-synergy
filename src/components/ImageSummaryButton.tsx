
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import SummaryDialog from './summary/SummaryDialog';
import { useParams } from 'react-router-dom';
import ImageTagManager from './ImageTagManager';
import { useImageSummary } from '@/hooks/useImageSummary';

interface ImageSummaryButtonProps {
  imageUrl: string;
  imageName: string;
}

const ImageSummaryButton: React.FC<ImageSummaryButtonProps> = ({
  imageUrl,
  imageName
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const params = useParams<{ projectId?: string; id?: string }>();
  // Use projectId from params or from id (support both formats)
  const projectId = params.projectId || params.id;

  // Debug logging to identify the issue
  useEffect(() => {
    console.log('Current params:', params);
    console.log('Project ID from params:', projectId);
    console.log('Image URL:', imageUrl);
  }, [params, projectId, imageUrl]);

  const { isGenerating, summary, hasSummary, generateSummary } = useImageSummary({
    imageUrl,
    projectId
  });

  const handleButtonClick = () => {
    if (!projectId) {
      toast.error('Project ID is missing. Please reload the page or navigate to the project again.');
      return;
    }

    setIsDialogOpen(true);
    
    // Only generate if we don't have a summary and we're not already generating
    if (!hasSummary && !isGenerating) {
      generateSummary();
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <div className="flex space-x-1">
        <Button 
          variant="outline" 
          size="sm"
          className={`text-xs px-2 py-1 h-7 flex items-center gap-1.5 ${hasSummary ? 'text-green-500 border-green-200 bg-green-50' : ''}`}
          onClick={handleButtonClick}
          disabled={isGenerating || !projectId}
          title={hasSummary ? "View AI Summary" : "Generate AI Summary"}
        >
          {isGenerating ? 
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 
            <MessageSquare className="h-3.5 w-3.5" />
          }
          <span>{hasSummary ? "View Summary" : "AI Summary"}</span>
        </Button>
      </div>

      <SummaryDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        title={`Description of "${imageName}"`}
        summary={summary}
        isLoading={isGenerating}
        hasSavedVersion={hasSummary}
        projectId={projectId}
        imageName={imageName}
      />
    </>
  );
};

export default ImageSummaryButton;
