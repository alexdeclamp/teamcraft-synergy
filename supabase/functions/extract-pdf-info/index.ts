
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
      .select('file_name, metadata')
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
      // Fetch the PDF file
      console.log('Fetching PDF from URL:', pdfUrl);
      const pdfResponse = await fetch(pdfUrl);
      
      if (!pdfResponse.ok) {
        throw new Error(`Failed to fetch PDF: ${pdfResponse.status} ${pdfResponse.statusText}`);
      }
      
      const pdfArrayBuffer = await pdfResponse.arrayBuffer();
      const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfArrayBuffer)));
      
      console.log('PDF fetched and converted to base64, length:', pdfBase64.length);

      // Call Claude API with PDF as base64
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
                  type: 'document',
                  source: {
                    type: 'base64',
                    media_type: 'application/pdf',
                    data: pdfBase64
                  }
                },
                {
                  type: "text",
                  text: `Please analyze this PDF document and extract the most important information.
                  
                  Create a structured summary with:
                  
                  1. MAIN SUMMARY: Brief overview of the document's key content (2-3 paragraphs)
                  2. KEY POINTS: Most important takeaways as bullet points
                  3. IMPORTANT DATA: Key figures, statistics, dates, or numbers
                  4. CONCLUSIONS & NEXT STEPS: Final conclusions and potential action items
                  
                  Be concise, focus on the most valuable information, and maintain the document's original meaning.`
                }
              ]
            }
          ]
        })
      });
      
      if (!claudeResponse.ok) {
        const errorText = await claudeResponse.text();
        console.error('Claude API error:', claudeResponse.status, errorText);
        throw new Error(`Claude API error: ${claudeResponse.status} - ${errorText}`);
      }
      
      const claudeData = await claudeResponse.json();
      
      if (!claudeData.content || claudeData.content.length === 0 || !claudeData.content[0].text) {
        console.error('Invalid response from Claude:', claudeData);
        throw new Error('Invalid response from Claude API');
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
        
        // Update the document metadata
        let updatedMetadata = { ...documentData.metadata } || {};
        updatedMetadata.extractedInfoNoteId = noteData.id;
        
        const { error: updateError } = await supabase
          .from('project_documents')
          .update({
            metadata: updatedMetadata
          })
          .eq('id', documentId);
          
        if (updateError) {
          console.error('Error updating document metadata:', updateError);
        }
      }
      
      // Return success response with summary and note ID
      return new Response(
        JSON.stringify({ 
          success: true, 
          summary,
          noteId: noteData?.id
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
      
    } catch (claudeError) {
      console.error('Error processing PDF with Claude:', claudeError);
      
      // Return error response with proper status and headers
      return new Response(
        JSON.stringify({ 
          error: claudeError instanceof Error ? claudeError.message : 'Unknown error processing PDF' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    console.error('Unhandled error in edge function:', error);
    
    // Return error response with proper status and headers
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
