
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getPrompt, ModelType } from './aiPrompts';

export type SummaryModel = ModelType;

export interface SummarizeTextOptions {
  text: string;
  model?: SummaryModel;
  maxLength?: number;
  title?: string;
  projectId?: string;
}

export async function summarizeText({
  text,
  model = 'claude',
  maxLength = 1500,
  title,
  projectId
}: SummarizeTextOptions): Promise<string> {
  if (!text || text.trim().length === 0) {
    throw new Error('No text provided for summarization');
  }

  try {
    const toastId = toast.info(`Summarizing text using ${model === 'claude' ? 'Claude' : 'OpenAI'}...`, {
      duration: 10000,
    });

    console.log(`Summarizing text with ${model}. Text length: ${text.length} characters`);
    console.log(`Sending to Supabase function with projectId: ${projectId || 'none'}`);

    // If text is too long, truncate it to avoid payload size issues
    const maxPayloadSize = 100000; // 100k chars
    let textToSummarize = text;
    let truncationWarning = '';
    
    if (text.length > maxPayloadSize) {
      console.warn(`Text too long (${text.length} chars), truncating to ${maxPayloadSize} chars`);
      textToSummarize = text.slice(0, maxPayloadSize);
      truncationWarning = `\n\nNote: The original text was ${text.length.toLocaleString()} characters, but was truncated to ${maxPayloadSize.toLocaleString()} characters for processing.`;
    }

    try {
      // Get the appropriate system prompt from our centralized prompt system
      const systemPrompt = getPrompt('summary', model);
      
      const { data, error } = await supabase.functions.invoke('summarize-text', {
        body: {
          text: textToSummarize,
          model,
          maxLength,
          title,
          projectId,
          systemPrompt
        },
      });

      // Dismiss the pending toast
      toast.dismiss(toastId);

      if (error) {
        console.error('Error from summarize-text function:', error);
        
        // Handle specific error types
        if (error.message?.includes('timeout')) {
          throw new Error('The summarization service took too long to respond. The document may be too complex.');
        } else if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
          throw new Error('AI service quota exceeded. Please try again in a few minutes.');
        } else {
          throw new Error(`Summarization failed: ${error.message || 'Unknown error'}`);
        }
      }

      if (!data || !data.summary) {
        const errorMsg = 'Received empty response from the summarization service';
        console.error(errorMsg);
        throw new Error(errorMsg);
      }

      toast.success(`Summary generated successfully using ${model === 'claude' ? 'Claude' : 'OpenAI'}`);
      
      // Add truncation warning if text was truncated
      return data.summary + truncationWarning;
    } catch (functionError: any) {
      toast.dismiss(toastId);
      console.error('Function invocation error:', functionError);
      throw functionError;
    }
  } catch (error: any) {
    console.error('Error summarizing text:', error);
    throw new Error(`Failed to summarize text: ${error.message || 'Unknown error'}`);
  }
}
