
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { pdfUrl, documentId, projectId, userId } = await req.json();
    
    if (!pdfUrl || !documentId || !projectId || !userId) {
      console.error('Missing required parameters:', { pdfUrl, documentId, projectId, userId });
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Server configuration error: Missing Supabase URL or service key');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get document details
    const { data: documentData, error: documentError } = await supabase
      .from('project_documents')
      .select('file_name')
      .eq('id', documentId)
      .single();
      
    if (documentError) {
      console.error('Error fetching document:', documentError);
      return new Response(
        JSON.stringify({ error: `Failed to fetch document: ${documentError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Claude API to extract information
    console.log("Calling Claude API to extract information from PDF:", pdfUrl);
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    
    if (!anthropicApiKey) {
      console.error('Claude API key not configured');
      return new Response(
        JSON.stringify({ error: 'Claude API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    try {
      const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1500,
          temperature: 0.2,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: "text",
                  text: `Please analyze the PDF document at this URL and extract the most important information.
                  
                  Create a structured summary with:
                  
                  1. MAIN SUMMARY: Brief overview of the document's key content (2-3 paragraphs)
                  2. KEY POINTS: Most important takeaways as bullet points
                  3. IMPORTANT DATA: Key figures, statistics, dates, or numbers
                  4. CONCLUSIONS & NEXT STEPS: Final conclusions and potential action items
                  
                  Be concise, focus on the most valuable information, and maintain the document's original meaning.`
                },
                {
                  type: "file_url",
                  file_url: {
                    url: pdfUrl
                  }
                }
              ]
            }
          ]
        })
      });
      
      if (!claudeResponse.ok) {
        const errorText = await claudeResponse.text();
        console.error('Claude API error:', claudeResponse.status, errorText);
        return new Response(
          JSON.stringify({ error: `Claude API error: ${claudeResponse.status} - ${errorText}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const claudeData = await claudeResponse.json();
      if (!claudeData.content || !claudeData.content[0] || !claudeData.content[0].text) {
        console.error('Invalid response from Claude:', claudeData);
        return new Response(
          JSON.stringify({ error: 'Invalid response from Claude API' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const summary = claudeData.content[0].text;
      
      console.log("Successfully extracted information from PDF");
      
      // Store the extracted information in the database
      const { data: noteData, error: noteError } = await supabase
        .from('project_notes')
        .insert({
          title: `PDF Analysis: ${documentData.file_name}`,
          content: summary,
          project_id: projectId,
          user_id: userId,
          tags: ['pdf', 'ai-extracted', 'analysis']
        })
        .select('id')
        .single();
      
      if (noteError) {
        console.error('Error creating note:', noteError);
        // Continue with returning the summary even if saving the note fails
      } else {
        console.log('Created note with extracted information, ID:', noteData.id);
        
        // Update the document with a reference to the note
        const { error: updateError } = await supabase
          .from('project_documents')
          .update({
            metadata: {
              extractedInfoNoteId: noteData.id
            }
          })
          .eq('id', documentId);
          
        if (updateError) {
          console.error('Error updating document metadata:', updateError);
        }
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          summary,
          noteId: noteData?.id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (claudeError: any) {
      console.error('Error calling Claude API:', claudeError);
      return new Response(
        JSON.stringify({ error: `Claude API error: ${claudeError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: any) {
    console.error('Error in extract-pdf-info function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
