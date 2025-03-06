
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileBase64, fileName, projectId, userId } = await req.json();
    
    if (!fileBase64 || !projectId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Decode base64 PDF
    const binaryPdf = Uint8Array.from(atob(fileBase64.split(',')[1]), c => c.charCodeAt(0));
    
    // Use pdfjs-dist to extract text - updated import to use a more reliable version
    const pdfjs = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/build/pdf.min.js');
    
    // Configure the worker
    pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/build/pdf.worker.min.js';
    
    // Load PDF data
    const loadingTask = pdfjs.getDocument({ data: binaryPdf });
    const pdf = await loadingTask.promise;
    
    // Extract text from all pages
    let extractedText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      extractedText += textContent.items.map((item) => item.str).join(' ') + '\n';
    }
    
    console.log(`Extracted ${extractedText.length} characters of text from PDF`);
    
    if (extractedText.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No text could be extracted from the PDF' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Store the PDF in Supabase Storage
    const timestamp = new Date().getTime();
    const filePath = `${userId}/${projectId}/${timestamp}_${fileName}`;
    
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
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        document: documentData,
        textLength: extractedText.length
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
