
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
  const { user } = useAuth();

  // Fetch existing summary when component mounts
  useEffect(() => {
    if (imageUrl && projectId) {
      fetchExistingSummary();
    } else {
      console.error('Missing required data to fetch summary:', { imageUrl, projectId });
    }
  }, [imageUrl, projectId]);

  const fetchExistingSummary = async () => {
    try {
      console.log('Fetching existing summary for image:', imageUrl);
      console.log('Project ID:', projectId);
      
      const { data, error } = await supabase
        .from('image_summaries')
        .select('summary')
        .eq('image_url', imageUrl)
        .eq('project_id', projectId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching summary:', error);
        return;
      }

      console.log('Summary data:', data);

      if (data && data.summary) {
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
      
      // If we already have a summary, no need to generate a new one
      if (hasSummary) {
        return;
      }
      
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
      // The edge function will process it with OpenAI
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
        throw new Error(`Error from edge function: ${response.error.message || response.error}`);
      }
      
      const data = response.data;
      console.log('Data from edge function:', data);
      
      if (!data) {
        throw new Error('No data received from edge function');
      }
      
      if (data.error) {
        throw new Error(`Error from OpenAI: ${data.error}`);
      }
      
      if (!data.summary) {
        console.error('Invalid response data structure:', data);
        throw new Error('Failed to get a valid summary from the edge function');
      }
      
      console.log('Received summary data:', data);
      setSummary(data.summary);
      setHasSummary(true);
      toast.success('Summary generated and saved successfully');
      
      // Refresh the summary data to ensure it was saved properly
      await fetchExistingSummary();
      
    } catch (error: any) {
      console.error('Error generating image summary:', error);
      setSummary(`Error: ${error.message}`);
      toast.error(`Failed to generate summary: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    summary,
    hasSummary,
    generateSummary,
    setSummary
  };
}
