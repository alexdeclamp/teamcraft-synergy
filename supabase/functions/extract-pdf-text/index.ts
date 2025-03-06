
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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
    console.log("Starting PDF to PNG conversion process");
    
    // First validate the request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("Request received with parameters:", Object.keys(requestBody).join(', '));
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid request format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { fileBase64, fileName, projectId, userId } = requestBody;
    
    if (!fileBase64 || !projectId || !userId) {
      console.error("Missing required parameters");
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Decoding PDF data");
    // Remove the base64 prefix (e.g., "data:application/pdf;base64,")
    let base64Data;
    try {
      base64Data = fileBase64.split(',')[1];
      if (!base64Data) {
        throw new Error('Invalid base64 format');
      }
    } catch (error) {
      console.error("Failed to process base64 data:", error);
      return new Response(
        JSON.stringify({ error: 'Invalid PDF data format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Convert base64 to binary
    let binaryPdf;
    try {
      binaryPdf = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      console.log(`Binary PDF size: ${binaryPdf.length} bytes`);
    } catch (error) {
      console.error("Failed to convert base64 to binary:", error);
      return new Response(
        JSON.stringify({ error: 'Failed to decode PDF data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Store the PDF in Supabase Storage
    const timestamp = new Date().getTime();
    const filePath = `${userId}/${projectId}/${timestamp}_${fileName}`;
    
    console.log("Uploading PDF to storage");
    // Upload PDF to storage
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from('project_documents')
      .upload(filePath, binaryPdf, {
        contentType: 'application/pdf',
        upsert: false
      });
      
    if (storageError) {
      console.error('Error uploading PDF to storage:', storageError);
      return new Response(
        JSON.stringify({ error: `Storage error: ${storageError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabase
      .storage
      .from('project_documents')
      .getPublicUrl(filePath);
    
    console.log("Saving document info to database");  
    // Save PDF document info to the database
    const { data: documentData, error: documentError } = await supabase
      .from('project_documents')
      .insert({
        project_id: projectId,
        user_id: userId,
        file_name: fileName,
        file_url: publicUrl,
        file_path: filePath,
        document_type: 'pdf'
      })
      .select()
      .single();
      
    if (documentError) {
      console.error('Error saving document to database:', documentError);
      return new Response(
        JSON.stringify({ error: `Database error: ${documentError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("PDF processing completed successfully");
    return new Response(
      JSON.stringify({ 
        success: true, 
        document: documentData,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in extract-pdf-text function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
