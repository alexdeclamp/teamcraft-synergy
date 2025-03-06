
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import SummaryDialog from './SummaryDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useParams } from 'react-router-dom';

interface ImageSummaryButtonProps {
  imageUrl: string;
  imageName: string;
}

const ImageSummaryButton: React.FC<ImageSummaryButtonProps> = ({
  imageUrl,
  imageName
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hasSummary, setHasSummary] = useState(false);
  const { user } = useAuth();
  const { projectId } = useParams();

  // Fetch existing summary when component mounts
  useEffect(() => {
    if (imageUrl && projectId) {
      fetchExistingSummary();
    }
  }, [imageUrl, projectId]);

  const fetchExistingSummary = async () => {
    try {
      const { data, error } = await supabase
        .from('image_summaries')
        .select('summary')
        .eq('image_url', imageUrl)
        .eq('project_id', projectId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching summary:', error);
        return;
      }

      if (data) {
        setSummary(data.summary);
        setHasSummary(true);
      }
    } catch (error) {
      console.error('Error checking for existing summary:', error);
    }
  };

  const generateSummary = async () => {
    try {
      setIsGenerating(true);
      setIsDialogOpen(true);
      
      // If we already have a summary, no need to generate a new one
      if (hasSummary) {
        return;
      }
      
      console.log('Generating summary for image:', imageUrl);
      console.log('For project:', projectId);
      
      const { data, error } = await supabase.functions.invoke('generate-summary', {
        body: {
          type: 'image',
          imageUrl: imageUrl,
          userId: user?.id,
          projectId: projectId
        },
      });

      if (error) {
        console.error('Error from edge function:', error);
        throw new Error(`Error from edge function: ${error.message}`);
      }
      
      if (!data || !data.summary) {
        console.error('Invalid response from edge function:', data);
        throw new Error('Failed to get a valid summary from the edge function');
      }
      
      console.log('Received summary data:', data);
      setSummary(data.summary);
      setHasSummary(true);
      toast.success('Summary generated and saved successfully');
    } catch (error: any) {
      console.error('Error generating image summary:', error);
      setSummary(`Failed to generate summary: ${error.message}`);
      toast.error('Failed to generate image summary');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleButtonClick = () => {
    setIsDialogOpen(true);
    if (!hasSummary) {
      generateSummary();
    }
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon"
        className={`h-7 w-7 ${hasSummary ? 'text-green-500' : ''}`}
        onClick={handleButtonClick}
        disabled={isGenerating}
        title={hasSummary ? "View AI Summary" : "Generate AI Summary"}
      >
        {isGenerating ? 
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 
          <MessageSquare className="h-3.5 w-3.5" />
        }
      </Button>

      <SummaryDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={`Description of "${imageName}"`}
        summary={summary}
        isLoading={isGenerating}
      />
    </>
  );
};

export default ImageSummaryButton;
