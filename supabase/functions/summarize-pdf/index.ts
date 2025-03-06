
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { decode as base64Decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

// Environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to extract text from PDF
async function extractTextFromPdf(fileBuffer: ArrayBuffer): Promise<string> {
  try {
    // This is a simplified text extraction - in production you might want a more robust solution
    const text = new TextDecoder().decode(fileBuffer);
    
    // Clean up binary data and extract readable text
    // This is a very simplified approach
    const cleanText = text.replace(/[^\x20-\x7E\n\r\t]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
      
    return cleanText;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

// Function to get summary from DeepSeek API
async function getSummaryFromDeepSeek(text: string): Promise<string> {
  try {
    // Call DeepSeek API
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get('DEEPSEEK_API_KEY')}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are a PDF summarizer. Create a concise but comprehensive summary of the PDF content provided, highlighting key points and main ideas."
          },
          {
            role: "user",
            content: `Please summarize the following PDF content:\n\n${text.substring(0, 15000)}` // Limit text to avoid token limits
          }
        ],
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("DeepSeek API error:", response.status, errorData);
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling DeepSeek API:", error);
    throw new Error("Failed to generate summary");
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileBase64, fileName, projectId, userId } = await req.json();
    
    if (!fileBase64 || !fileName || !projectId || !userId) {
      throw new Error('Missing required parameters');
    }
    
    console.log('Processing PDF:', fileName);
    console.log('Project ID:', projectId);
    console.log('User ID:', userId);
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    // Extract base64 data part if it includes data URL prefix
    const base64Data = fileBase64.includes('base64,') 
      ? fileBase64.split('base64,')[1] 
      : fileBase64;
    
    // Convert base64 to buffer
    const pdfBuffer = base64Decode(base64Data);
    
    // Extract text from PDF
    console.log('Extracting text from PDF...');
    const extractedText = await extractTextFromPdf(pdfBuffer);
    const textSample = extractedText.substring(0, 200);
    console.log('Extracted text sample:', textSample + '...');
    
    // Get summary from DeepSeek
    console.log('Generating summary using DeepSeek...');
    const summary = await getSummaryFromDeepSeek(extractedText);
    console.log('Summary generated successfully');
    
    // Store file in Supabase Storage
    const fileExt = fileName.split('.').pop();
    const filePath = `${projectId}/${Date.now()}_${fileName}`;
    
    // Check if the bucket exists, create it if it doesn't
    const { data: buckets } = await supabase.storage.listBuckets();
    const projectsBucket = buckets?.find(b => b.name === 'project-documents');
    
    if (!projectsBucket) {
      console.log('Creating project-documents bucket...');
      await supabase.storage.createBucket('project-documents', {
        public: false,
        fileSizeLimit: 20971520, // 20MB
      });
    }
    
    // Upload file to storage
    console.log('Uploading file to storage...');
    const { data: storageData, error: storageError } = await supabase.storage
      .from('project-documents')
      .upload(filePath, new Uint8Array(pdfBuffer), {
        contentType: 'application/pdf',
        upsert: true
      });
    
    if (storageError) {
      console.error('Storage error:', storageError);
      throw new Error(`Storage error: ${storageError.message}`);
    }
    
    // Get file URL
    const { data: { publicUrl } } = supabase.storage
      .from('project-documents')
      .getPublicUrl(filePath);
    
    // Save document record in database
    console.log('Saving document record...');
    const { data: documentData, error: documentError } = await supabase
      .from('project_documents')
      .insert({
        project_id: projectId,
        uploaded_by: userId,
        file_name: fileName,
        file_url: publicUrl,
        document_type: 'pdf',
        summary: summary,
      })
      .select()
      .single();
    
    if (documentError) {
      console.error('Document record error:', documentError);
      throw new Error(`Document record error: ${documentError.message}`);
    }
    
    console.log('PDF processed successfully!');
    
    return new Response(JSON.stringify({
      success: true,
      document: documentData,
      summary: summary
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
