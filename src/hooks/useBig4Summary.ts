
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface UseBig4SummaryProps {
  pdfContent: string;
  pdfSummary: string;
  fileName: string;
  model?: 'claude' | 'openai';
}

export interface Big4Summary {
  executiveSummary: string;
  description: string;
  keyLearnings: string[];
  blockers: string[] | null;
  nextSteps: string[];
}

export function useBig4Summary({
  pdfContent,
  pdfSummary,
  fileName,
  model = 'claude'
}: UseBig4SummaryProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [big4Summary, setBig4Summary] = useState<Big4Summary | null>(null);

  const generateBig4Summary = async () => {
    if (!pdfContent && !pdfSummary) {
      toast.error('No content available to create a Big 4 Summary');
      return;
    }

    setIsGenerating(true);
    
    try {
      const toastId = toast.loading(`Generating Big 4 Summary using ${model === 'claude' ? 'Claude' : 'OpenAI'}...`, {
        duration: 30000,
      });
      
      // Use the summary if available, otherwise use the full content
      const contentToProcess = pdfSummary || pdfContent;
      
      const { data, error } = await supabase.functions.invoke('generate-big4-summary', {
        body: {
          content: contentToProcess,
          fileName,
          model
        },
      });
      
      toast.dismiss(toastId);
      
      if (error) {
        console.error('Error from generate-big4-summary function:', error);
        throw error;
      }
      
      if (!data || !data.summary) {
        throw new Error('Received empty or invalid response from the summary generator');
      }
      
      setBig4Summary(data.summary);
      toast.success('Big 4 Summary generated successfully');
      return data.summary;
    } catch (error: any) {
      console.error('Error generating Big 4 Summary:', error);
      toast.error(`Failed to generate Big 4 Summary: ${error.message || 'Unknown error'}`);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    big4Summary,
    generateBig4Summary,
    setBig4Summary
  };
}
