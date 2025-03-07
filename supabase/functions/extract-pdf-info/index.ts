
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.18.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfUrl, documentId, projectId, userId } = await req.json();
    
    if (!pdfUrl || !documentId || !projectId || !userId) {
      console.error('Missing required parameters:', { pdfUrl, documentId, projectId, userId });
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      return new Response(
        JSON.stringify({ error: 'Anthropic API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: anthropicApiKey
    });

    console.log('Calling Claude API with URL:', pdfUrl);
    
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'url',
                url: pdfUrl,
              },
            },
            {
              type: 'text',
              text: `Please analyze this PDF document and extract the most important information.
              
              Create a structured summary with:
              
              1. MAIN SUMMARY: Brief overview of the document's key content (2-3 paragraphs)
              2. KEY POINTS: Most important takeaways as bullet points
              3. IMPORTANT DATA: Key figures, statistics, dates, or numbers
              4. CONCLUSIONS & NEXT STEPS: Final conclusions and potential action items
              
              Be concise, focus on the most valuable information, and maintain the document's original meaning.`
            },
          ],
        },
      ],
    });

    if (!response.content || response.content.length === 0) {
      throw new Error('Invalid response from Claude API');
    }

    const summary = response.content[0].text;
    console.log('Successfully extracted information from PDF');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create note with the extracted information
    const { data: noteData, error: noteError } = await supabase
      .from('project_notes')
      .insert({
        title: `PDF Analysis`,
        content: summary,
        project_id: projectId,
        user_id: userId,
        tags: ['pdf', 'ai-extracted', 'analysis']
      })
      .select('id')
      .single();

    if (noteError) {
      console.error('Error creating note:', noteError);
      throw noteError;
    }

    // Update the document metadata with the note ID
    const { error: updateError } = await supabase
      .from('project_documents')
      .update({
        metadata: { extractedInfoNoteId: noteData.id }
      })
      .eq('id', documentId);

    if (updateError) {
      console.error('Error updating document metadata:', updateError);
      // Continue even if metadata update fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        summary,
        noteId: noteData.id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in edge function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
