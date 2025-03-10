
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type SummaryModel = 'claude' | 'openai';

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
    toast.info(`Summarizing text using ${model === 'claude' ? 'Claude' : 'OpenAI'}...`, {
      duration: 5000,
    });

    const { data, error } = await supabase.functions.invoke('summarize-text', {
      body: {
        text: text.slice(0, 100000), // Limit to 100k chars to avoid payload issues
        model,
        maxLength,
        title,
        projectId
      },
    });

    if (error) {
      console.error('Error from summarize-text function:', error);
      throw error;
    }

    if (!data || !data.summary) {
      throw new Error('Received empty response from the summarization service');
    }

    return data.summary;
  } catch (error: any) {
    console.error('Error summarizing text:', error);
    throw new Error(`Failed to summarize text: ${error.message || 'Unknown error'}`);
  }
}
