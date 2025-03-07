
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import SummaryDialog from './SummaryDialog';
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
    if (!hasSummary && !summary) {
      generateSummary();
    }
  };

  return (
    <>
      <div className="flex space-x-1">
        <Button 
          variant="ghost" 
          size="icon"
          className={`h-7 w-7 ${hasSummary ? 'text-green-500' : ''}`}
          onClick={handleButtonClick}
          disabled={isGenerating || !projectId}
          title={hasSummary ? "View AI Summary" : "Generate AI Summary"}
        >
          {isGenerating ? 
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 
            <MessageSquare className="h-3.5 w-3.5" />
          }
        </Button>

        <ImageTagManager imageUrl={imageUrl} projectId={projectId} />
      </div>

      <SummaryDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={`Description of "${imageName}"`}
        summary={summary}
        isLoading={isGenerating}
        hasSavedVersion={hasSummary}
      />
    </>
  );
};

export default ImageSummaryButton;
