
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import SummaryDialog from './summary/SummaryDialog';
import { useImageSummary } from '@/hooks/useImageSummary';
import ImageSummaryButtonUI from './summary/ImageSummaryButtonUI';

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
    console.log('Image Name:', imageName);
  }, [params, projectId, imageUrl, imageName]);

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
        <ImageSummaryButtonUI
          onClick={handleButtonClick}
          isGenerating={isGenerating}
          hasSummary={hasSummary}
          disabled={!projectId}
        />
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
        sourceUrl={imageUrl}
        sourceType="image"
      />
    </>
  );
};

export default ImageSummaryButton;
