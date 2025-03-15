import { useState } from 'react';
import { toast } from 'sonner';
import { summarizeText, SummaryModel } from '@/utils/summaryUtils';

interface UsePdfSummarizationProps {
  extractedText: string;
  fileName: string;
  projectId?: string;
}

export const usePdfSummarization = ({ 
  extractedText, 
  fileName, 
  projectId 
}: UsePdfSummarizationProps) => {
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState('');
  const [showSummary, setShowSummary] = useState(false);

  const handleSummarizeText = async (model: SummaryModel = 'claude') => {
    if (!extractedText) {
      toast.error('No text available to summarize', {
        description: "Text must be extracted before it can be summarized.",
      });
      return;
    }

    setIsSummarizing(true);
    setSummary('');

    try {
      console.log(`Starting summarization with ${model}...`);
      console.log(`Text length: ${extractedText.length} characters`);
      
      const toastId = toast.loading(`Summarizing text using ${model === 'claude' ? 'Claude' : 'OpenAI'}...`, {
        duration: 30000, // Longer duration for summarization
      });
      
      try {
        const result = await summarizeText({
          text: extractedText,
          model,
          title: fileName,
          projectId,
          maxLength: 2000
        });

        console.log("Summary received:", result ? "success" : "empty");
        
        if (!result) {
          throw new Error("Received empty summary from the service");
        }

        setSummary(result);
        setShowSummary(true);
        toast.dismiss(toastId);
        toast.success(`Text summarized successfully using ${model === 'claude' ? 'Claude' : 'OpenAI'}`);
      } catch (summaryError: any) {
        toast.dismiss(toastId);
        throw summaryError;
      }
    } catch (error: any) {
      console.error('Error summarizing text:', error);
      
      // Provide more specific error messages based on common issues
      let errorMessage = 'Failed to summarize text';
      let description = '';
      
      if (error.message.includes('token')) {
        errorMessage = 'Text too large to summarize';
        description = 'The document contains too much text for the AI model. Try extracting a smaller portion.';
      } else if (error.message.includes('rate limit') || error.message.includes('429')) {
        errorMessage = 'Rate limit exceeded';
        description = 'Please wait a moment before trying again. Our AI service has temporary limits.';
      } else if (error.message.includes('network') || error.message.includes('timeout')) {
        errorMessage = 'Network issue during summarization';
        description = 'Check your internet connection and try again.';
      } else {
        description = error.message;
      }
      
      toast.error(errorMessage, {
        description: description,
        duration: 6000
      });
      setShowSummary(false);
    } finally {
      setIsSummarizing(false);
    }
  };

  const toggleTextView = () => {
    setShowSummary(!showSummary);
  };

  return {
    isSummarizing,
    summary,
    showSummary,
    setShowSummary,
    handleSummarizeText,
    toggleTextView
  };
};
