
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

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
    const { pdfUrl, fileName, projectId } = await req.json();
    
    if (!pdfUrl) {
      return new Response(
        JSON.stringify({ error: 'PDF URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!anthropicApiKey) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase credentials are not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Summarizing PDF: ${fileName}`);
    console.log(`PDF URL: ${pdfUrl}`);
    
    // Initialize Supabase client to access storage with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Extract the path from the URL
    const urlObj = new URL(pdfUrl);
    const pathParts = urlObj.pathname.split('/');
    const bucketName = pathParts[1]; // The bucket name is usually after the first slash
    const filePath = pathParts.slice(2).join('/'); // The rest is the file path
    
    console.log(`Extracted bucket: ${bucketName}, path: ${filePath}`);
    
    // Download the PDF file
    const { data: fileData, error: fileError } = await supabase
      .storage
      .from(bucketName)
      .download(filePath);
      
    if (fileError) {
      console.error('Error downloading PDF:', fileError);
      return new Response(
        JSON.stringify({ error: `Failed to download PDF: ${fileError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Convert the file to base64
    const reader = new FileReader();
    const base64Promise = new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });
    reader.readAsDataURL(fileData);
    const base64Data = await base64Promise;
    const base64String = String(base64Data).split(',')[1]; // Remove the data URL prefix
    
    console.log("PDF downloaded and converted to base64");
    
    // Call Claude API with improved error handling
    try {
      console.log("Calling Claude API with base64 PDF data...");
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: "claude-3-opus-20240229",
          max_tokens: 1500,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Please provide a comprehensive summary of this PDF document. 
                  
                  Include the following in your summary:
                  1. The main purpose and key points of the document
                  2. Important facts, figures, and findings
                  3. Any conclusions or recommendations
                  
                  Format your response in a clear, structured way using paragraphs, bullet points, and headings as appropriate.`
                },
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: "application/pdf",
                    data: base64String
                  }
                }
              ]
            }
          ]
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Claude API error: ${response.status}`, errorText);
        return new Response(
          JSON.stringify({ error: `Claude API error: ${response.status}. Details: ${errorText}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const data = await response.json();
      console.log("Claude API response received:", JSON.stringify(data).slice(0, 200) + "...");
      
      if (!data.content || !data.content[0] || !data.content[0].text) {
        console.error('Invalid response from Claude API:', data);
        return new Response(
          JSON.stringify({ error: 'Invalid response format from Claude API' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const summary = data.content[0].text;
      
      console.log("Summary generated successfully");
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          summary: summary,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (apiError) {
      console.error('Error calling Claude API:', apiError);
      return new Response(
        JSON.stringify({ 
          error: `Error calling Claude API: ${apiError.message || 'Unknown API error'}`,
          details: apiError.stack || ''
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
  } catch (error) {
    console.error('Error in summarize-pdf function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        details: error.stack || '' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
