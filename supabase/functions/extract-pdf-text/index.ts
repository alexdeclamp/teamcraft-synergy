
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import * as pdfJs from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.14.305/build/pdf.js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configure the worker
// We'll use a bare minimum fake worker for Deno environment
const fakeWorker = {
  postMessage: async function(obj) {
    // Simplified worker implementation
    if (this.onmessage) {
      await this.onmessage({ data: { callback: obj.data?.callback, result: 0 } });
    }
  },
  onmessage: null
};

// Set the worker
pdfJs.GlobalWorkerOptions.workerPort = fakeWorker;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting PDF extraction process");
    const { fileBase64, fileName, projectId, userId } = await req.json();
    
    if (!fileBase64 || !projectId || !userId) {
      console.error("Missing required parameters");
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Decoding PDF data");
    // Remove the base64 prefix (e.g., "data:application/pdf;base64,")
    const base64Data = fileBase64.split(',')[1];
    // Convert base64 to binary
    const binaryPdf = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    console.log("Loading PDF document");
    try {
      // Initialize PDF document
      const loadingTask = pdfJs.getDocument({ data: binaryPdf });
      const pdf = await loadingTask.promise;
      
      console.log(`PDF loaded with ${pdf.numPages} pages`);
      
      // Extract text from all pages
      let extractedText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        console.log(`Processing page ${i}`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(' ');
        extractedText += pageText + '\n';
      }
      
      console.log(`Extracted ${extractedText.length} characters of text from PDF`);
      
      if (extractedText.length === 0) {
        console.error("No text extracted from PDF");
        return new Response(
          JSON.stringify({ error: 'No text could be extracted from the PDF' }),
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
        throw storageError;
      }
      
      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase
        .storage
        .from('project_documents')
        .getPublicUrl(filePath);
      
      console.log("Saving document info to database");  
      // Save PDF document info and text to the database
      const { data: documentData, error: documentError } = await supabase
        .from('project_documents')
        .insert({
          project_id: projectId,
          user_id: userId,
          file_name: fileName,
          file_url: publicUrl,
          file_path: filePath,
          content_text: extractedText,
          document_type: 'pdf'
        })
        .select()
        .single();
        
      if (documentError) {
        console.error('Error saving document to database:', documentError);
        throw documentError;
      }
      
      console.log("PDF processing completed successfully");
      return new Response(
        JSON.stringify({ 
          success: true, 
          document: documentData,
          textLength: extractedText.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (pdfError) {
      console.error("Error processing PDF document:", pdfError);
      throw new Error(`PDF processing error: ${pdfError.message}`);
    }
  } catch (error) {
    console.error('Error in extract-pdf-text function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
