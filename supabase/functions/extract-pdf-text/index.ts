
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
    console.log("Starting PDF extraction process");
    
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
    
    const { fileBase64, fileName, projectId, userId, createNote = false } = requestBody;
    
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
    let pdf;
    try {
      pdf = await pdfjs.getDocument({ data: binaryPdf }).promise;
      console.log(`PDF loaded successfully. Number of pages: ${pdf.numPages}`);
    } catch (error) {
      console.error("Failed to load PDF:", error);
      return new Response(
        JSON.stringify({ error: 'Failed to parse PDF document' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const timestamp = new Date().getTime();
    const fileNameWithoutExt = fileName.replace(/\.pdf$/i, '');
    const images = [];
    let extractedText = '';
    
    // Process each page of the PDF
    for (let i = 1; i <= pdf.numPages; i++) {
      console.log(`Processing page ${i} of ${pdf.numPages}`);
      const page = await pdf.getPage(i);
      
      // Extract text content from the page
      try {
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        extractedText += `--- Page ${i} ---\n${pageText}\n\n`;
        console.log(`Extracted ${pageText.length} characters of text from page ${i}`);
      } catch (error) {
        console.error(`Error extracting text from page ${i}:`, error);
        // Continue processing other pages even if text extraction fails
      }
      
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

    // Validate extracted text
    if (!extractedText || extractedText.trim() === '') {
      console.warn("No text was extracted from the PDF. The document might be image-based or secured.");
      extractedText = "No text content could be extracted from this PDF. It may be an image-based document or have security restrictions.";
    } else {
      console.log(`Total extracted text: ${extractedText.length} characters`);
    }

    // Also upload the original PDF file for Claude to access directly
    const pdfPath = `${userId}/${projectId}/${timestamp}_${fileName}`;
    console.log(`Uploading original PDF to storage: ${pdfPath}`);
    const { data: pdfStorageData, error: pdfStorageError } = await supabase
      .storage
      .from(bucketName)
      .upload(pdfPath, binaryPdf, {
        contentType: 'application/pdf',
        upsert: false
      });
      
    if (pdfStorageError) {
      console.error(`Error uploading PDF to storage:`, pdfStorageError);
      return new Response(
        JSON.stringify({ error: `Storage error: ${pdfStorageError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get public URL for the uploaded PDF
    const { data: { publicUrl: pdfPublicUrl } } = supabase
      .storage
      .from(bucketName)
      .getPublicUrl(pdfPath);
    
    let noteId = null;
    let summary = null;

    // Generate note using Claude API if requested
    if (createNote) {
      try {
        console.log("Generating note summary using Claude API");
        const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
        
        if (!anthropicApiKey) {
          console.error("Missing Anthropic API key");
          throw new Error('Anthropic API key not configured');
        }

        // Send the PDF URL directly to Claude
        console.log("Sending PDF URL to Claude:", pdfPublicUrl);
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
                    text: `Please analyze the PDF document at this URL: ${pdfPublicUrl}
                    
                    Create a structured note with the following:
                    
                    1. A brief summary of the main content (2-3 paragraphs)
                    2. Key points or takeaways (bullet points)
                    3. Any important data, dates, or numbers mentioned
                    4. Suggested next actions (if applicable)
                    
                    Please be concise and focus on the most valuable information.`
                  },
                  {
                    type: "file_url",
                    file_url: {
                      url: pdfPublicUrl
                    }
                  }
                ]
              }
            ]
          })
        });
        
        if (!claudeResponse.ok) {
          const errorData = await claudeResponse.text();
          console.error("Claude API error:", errorData);
          throw new Error(`Claude API error: ${claudeResponse.status}`);
        }
        
        const claudeData = await claudeResponse.json();
        summary = claudeData.content[0].text;
        
        console.log("Successfully generated note summary");
        
        // Create note in database
        const { data: noteData, error: noteError } = await supabase
          .from('project_notes')
          .insert({
            title: `PDF Summary: ${fileNameWithoutExt}`,
            content: summary,
            project_id: projectId,
            user_id: userId,
            tags: ['pdf', 'ai-generated']
          })
          .select()
          .single();
          
        if (noteError) {
          console.error('Error creating note:', noteError);
          throw noteError;
        }
        
        noteId = noteData.id;
        console.log(`Created note with ID: ${noteId}`);
      } catch (error) {
        console.error('Error generating note:', error);
        // Continue with file processing even if note generation fails
      }
    }

    // Save document info in the database with references to all pages
    console.log("Saving document info to database with extracted text");
    const { data: documentData, error: documentError } = await supabase
      .from('project_documents')
      .insert({
        project_id: projectId,
        user_id: userId,
        file_name: fileName,
        file_url: images.length > 0 ? images[0].url : null, // Use first image as main URL
        file_path: pdfPath, // Path to the original PDF
        document_type: 'pdf',
        content_text: extractedText,
        file_size: binaryPdf.length,
        metadata: {
          pages: images.map(img => ({ 
            page: img.page, 
            url: img.url,
            path: img.path
          })),
          pdf_url: pdfPublicUrl,
          totalPages: pdf.numPages,
          associatedNoteId: noteId,
          extractedTextLength: extractedText.length
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
    
    console.log("PDF extraction completed successfully");
    return new Response(
      JSON.stringify({ 
        success: true, 
        document: documentData,
        pages: images.length,
        images: images,
        pdfUrl: pdfPublicUrl,
        noteId: noteId,
        summary: summary,
        textExtracted: extractedText.length > 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in PDF extraction function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
