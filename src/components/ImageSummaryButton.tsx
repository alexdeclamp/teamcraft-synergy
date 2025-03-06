
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import SummaryDialog from './SummaryDialog';

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

  const generateSummary = async () => {
    try {
      setIsGenerating(true);
      setIsDialogOpen(true);
      
      const { data, error } = await supabase.functions.invoke('generate-summary', {
        body: {
          type: 'image',
          imageUrl: imageUrl,
        },
      });

      if (error) throw error;
      
      setSummary(data.summary);
    } catch (error: any) {
      console.error('Error generating image summary:', error);
      toast.error('Failed to generate image summary');
      setIsDialogOpen(false);
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
