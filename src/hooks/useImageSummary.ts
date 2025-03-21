
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface UseImageSummaryProps {
  imageUrl: string;
  projectId: string | undefined;
}

export function useImageSummary({ imageUrl, projectId }: UseImageSummaryProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState('');
  const [hasSummary, setHasSummary] = useState(false);
  const [isNoteSaved, setIsNoteSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Reset states when props change
  useEffect(() => {
    if (imageUrl) {
      setSummary('');
      setHasSummary(false);
      setIsNoteSaved(false);
      setError(null);
      fetchExistingSummary();
      checkForExistingNote();
    }
  }, [imageUrl, projectId]);

  const fetchExistingSummary = async () => {
    try {
      console.log('Fetching existing summary for image:', imageUrl);
      console.log('Project ID:', projectId);
      
      if (!imageUrl || !projectId) {
        setHasSummary(false);
        setSummary('');
        return;
      }
      
      // Use exact equality for image_url and project_id when querying
      const { data, error } = await supabase
        .from('image_summaries')
        .select('summary')
        .eq('image_url', imageUrl)
        .eq('project_id', projectId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching summary:', error);
        setHasSummary(false);
        return;
      }

      console.log('Summary data:', data);

      if (data && data.summary && data.summary.trim() !== '') {
        setSummary(data.summary);
        setHasSummary(true);
      } else {
        setSummary('');
        setHasSummary(false);
      }
    } catch (error) {
      console.error('Error checking for existing summary:', error);
      setHasSummary(false);
    }
  };

  // Check if this image summary has already been saved as a note
  const checkForExistingNote = async () => {
    try {
      if (!projectId || !imageUrl) return;

      // Fix: Replace the problematic filter operation with a more direct query approach
      const { data, error } = await supabase
        .from('project_notes')
        .select('id')
        .eq('project_id', projectId)
        .eq('source_document->>type', 'image')
        .eq('source_document->>url', imageUrl)
        .maybeSingle();

      if (error) {
        console.error('Error checking for existing note:', error);
        return;
      }

      setIsNoteSaved(!!data);
      console.log('Is note already saved:', !!data);
    } catch (error) {
      console.error('Error checking for existing note:', error);
    }
  };

  const generateSummary = async () => {
    try {
      // Reset states at the beginning of generation
      setIsGenerating(true);
      setHasSummary(false);
      setSummary('');
      setError(null);
      
      console.log('Generating summary for image:', imageUrl);
      console.log('For project:', projectId);
      
      // Ensure projectId is included as a string in the request
      if (!projectId) {
        throw new Error('Project ID is missing, cannot generate summary');
      }
      
      if (!user?.id) {
        throw new Error('User ID is missing, cannot generate summary');
      }
      
      // For image summarization, we need to send the image URL
      // The edge function will now download and process the image
      const response = await supabase.functions.invoke('generate-summary', {
        body: {
          type: 'image',
          content: imageUrl, // Send the URL as content for images
          imageUrl: imageUrl,
          userId: user.id,
          projectId: projectId
        },
      });

      console.log('Response from edge function:', response);
      
      if (response.error) {
        console.error('Error from edge function:', response.error);
        
        // Check if the error is due to API limit being reached (from error message)
        if (response.error.message?.includes('Daily API limit reached') || (response.data && response.data.limitReached)) {
          setError('You have reached your daily AI API limit. Free accounts are limited to 10 AI operations per day. Please upgrade to Pro for unlimited API calls.');
          toast.error('Daily AI API limit reached', {
            description: 'Free accounts are limited to 10 AI operations per day. Upgrade to Pro for unlimited API calls.'
          });
          return;
        }
        
        throw new Error(`Error from edge function: ${response.error.message || response.error}`);
      }
      
      const data = response.data;
      console.log('Data from edge function:', data);
      
      if (!data) {
        throw new Error('No data received from edge function');
      }
      
      if (data.error) {
        // Check if the error is related to API limit
        if (data.limitReached) {
          setError('You have reached your daily AI API limit. Free accounts are limited to 10 AI operations per day. Please upgrade to Pro for unlimited API calls.');
          toast.error('Daily AI API limit reached', {
            description: 'Free accounts are limited to 10 AI operations per day. Upgrade to Pro for unlimited API calls.'
          });
          return;
        }
        
        throw new Error(`Error from OpenAI: ${data.error}`);
      }
      
      if (!data.summary || data.summary.trim() === '') {
        console.error('Invalid response data structure:', data);
        throw new Error('Failed to get a valid summary from the edge function');
      }
      
      console.log('Received summary data:', data);
      setSummary(data.summary);
      setHasSummary(true);
      toast.success('Summary generated and saved successfully');
      
      // Check if a note already exists for this image after generation
      checkForExistingNote();
      
    } catch (error: any) {
      console.error('Error generating image summary:', error);
      setSummary('');
      setHasSummary(false);
      
      // Check if the error message contains limit-related wording
      if (error.message && error.message.toLowerCase().includes('limit')) {
        setError('You have reached your daily AI API limit. Free accounts are limited to 10 AI operations per day. Please upgrade to Pro for unlimited API calls.');
        toast.error('Daily AI API limit reached', {
          description: 'Free accounts are limited to 10 AI operations per day. Upgrade to Pro for unlimited API calls.'
        });
      } else {
        setError(error.message || 'Failed to generate summary');
        toast.error(`Failed to generate summary: ${error.message}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    summary,
    hasSummary,
    isNoteSaved,
    error,
    generateSummary,
    setSummary,
    setIsNoteSaved
  };
}
