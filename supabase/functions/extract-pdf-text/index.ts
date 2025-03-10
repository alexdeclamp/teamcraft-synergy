
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as pdfjs from "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/build/pdf.min.js";

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
    const { pdfUrl } = await req.json();
    
    if (!pdfUrl) {
      return new Response(
        JSON.stringify({ error: 'PDF URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Starting to extract text from PDF: ${pdfUrl}`);
    
    try {
      // Fetch the PDF with timeout and retry logic
      const response = await fetchWithRetry(pdfUrl, 3);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
      }
      
      // Get the PDF as ArrayBuffer
      const pdfData = await response.arrayBuffer();
      
      // Initialize pdf.js
      console.log("PDF data received, size:", pdfData.byteLength);
      
      // Load the PDF with pdf.js
      const loadingTask = pdfjs.getDocument({ data: new Uint8Array(pdfData) });
      const pdf = await loadingTask.promise;
      
      console.log(`PDF loaded with ${pdf.numPages} pages`);
      
      // Extract text from each page
      let textContent = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        console.log(`Processing page ${i}/${pdf.numPages}`);
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map(item => item.str);
        textContent += strings.join(' ') + '\n';
        
        // Free memory
        if (page && typeof page.cleanup === 'function') {
          page.cleanup();
        }
      }
      
      console.log(`Extraction complete: ${textContent.length} characters extracted`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          text: textContent,
          pageCount: pdf.numPages
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } catch (extractError) {
      console.error('Error extracting text:', extractError.message, extractError.stack);
      return new Response(
        JSON.stringify({ error: `Failed to extract text: ${extractError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
  } catch (error) {
    console.error('Error in extract-pdf-text function:', error.message, error.stack);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        details: error.stack || '' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Utility function to fetch with retry
async function fetchWithRetry(url: string, maxRetries: number): Promise<Response> {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Fetch attempt ${attempt}/${maxRetries} for ${url}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        return response;
      } catch (err) {
        clearTimeout(timeoutId);
        throw err;
      }
    } catch (error) {
      console.warn(`Attempt ${attempt} failed:`, error.message);
      lastError = error;
      
      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}
