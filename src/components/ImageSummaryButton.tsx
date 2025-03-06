
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import SummaryDialog from './SummaryDialog';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();

  const generateSummary = async () => {
    try {
      setIsGenerating(true);
      setIsDialogOpen(true);
      
      console.log('Generating summary for image:', imageUrl);
      
      const { data, error } = await supabase.functions.invoke('generate-summary', {
        body: {
          type: 'image',
          imageUrl: imageUrl,
          userId: user?.id // Pass the user ID to save the summary
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
      toast.success('Summary generated and saved successfully');
    } catch (error: any) {
      console.error('Error generating image summary:', error);
      setSummary(`Failed to generate summary: ${error.message}`);
      toast.error('Failed to generate image summary');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon"
        className="h-7 w-7"
        onClick={generateSummary}
        disabled={isGenerating}
        title="Generate AI Summary"
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
