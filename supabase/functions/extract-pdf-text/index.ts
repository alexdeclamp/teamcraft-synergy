
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import * as pdfjs from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/+esm';

// Configure PDF.js worker
const pdfjsWorker = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.mjs');
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

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

    // Create storage bucket if it doesn't exist
    const bucketName = 'project_documents';
    const { data: bucketData, error: bucketError } = await supabase
      .storage
      .getBucket(bucketName);
      
    if (bucketError && bucketError.message.includes('The resource was not found')) {
      console.log(`Creating bucket: ${bucketName}`);
      await supabase.storage.createBucket(bucketName, {
        public: true
      });
    }

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

    // Load the PDF using PDF.js
    console.log("Loading PDF with PDF.js");
    const pdf = await pdfjs.getDocument({ data: binaryPdf }).promise;
    console.log(`PDF loaded successfully. Number of pages: ${pdf.numPages}`);
    
    const timestamp = new Date().getTime();
    const fileNameWithoutExt = fileName.replace(/\.pdf$/i, '');
    const images = [];
    
    // Process each page of the PDF
    for (let i = 1; i <= pdf.numPages; i++) {
      console.log(`Processing page ${i} of ${pdf.numPages}`);
      const page = await pdf.getPage(i);
      
      // Set scale for better resolution
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = new OffscreenCanvas(viewport.width, viewport.height);
      const context = canvas.getContext('2d');
      
      // Prepare canvas for rendering
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      // Render the page to canvas
      await page.render(renderContext).promise;
      
      // Convert canvas to PNG
      const pngBlob = await canvas.convertToBlob({ type: 'image/png' });
      const pngArrayBuffer = await pngBlob.arrayBuffer();
      const pngUint8Array = new Uint8Array(pngArrayBuffer);
      
      // Define file path and name for this page
      const imagePath = `${userId}/${projectId}/${timestamp}_${fileNameWithoutExt}_page_${i}.png`;
      
      // Upload PNG to storage
      console.log(`Uploading page ${i} as PNG to storage`);
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from(bucketName)
        .upload(imagePath, pngUint8Array, {
          contentType: 'image/png',
          upsert: false
        });
        
      if (storageError) {
        console.error(`Error uploading page ${i} to storage:`, storageError);
        continue;
      }
      
      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase
        .storage
        .from(bucketName)
        .getPublicUrl(imagePath);
      
      images.push({
        page: i,
        url: publicUrl,
        path: imagePath
      });
    }

    // Save document info in the database with references to all pages
    console.log("Saving document info to database");
    const { data: documentData, error: documentError } = await supabase
      .from('project_documents')
      .insert({
        project_id: projectId,
        user_id: userId,
        file_name: fileName,
        file_url: images.length > 0 ? images[0].url : null, // Use first image as main URL
        file_path: `${userId}/${projectId}/${timestamp}_${fileName}`, // Original reference path
        document_type: 'png',
        metadata: {
          pages: images.map(img => ({ 
            page: img.page, 
            url: img.url,
            path: img.path
          })),
          totalPages: pdf.numPages
        }
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
    
    console.log("PDF to PNG conversion completed successfully");
    return new Response(
      JSON.stringify({ 
        success: true, 
        document: documentData,
        pages: images.length,
        images: images
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in PDF to PNG conversion function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
