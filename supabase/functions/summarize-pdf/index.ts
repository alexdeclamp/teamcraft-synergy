
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
    
    console.log('Processing PDF upload:', fileName);
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
    
    // Store file in Supabase Storage
    const filePath = `${userId}/${projectId}/${Date.now()}_${fileName}`;
    
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
    console.log(`Uploading file to storage with path: ${filePath}`);
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
        file_path: filePath
      })
      .select()
      .single();
    
    if (documentError) {
      console.error('Document record error:', documentError);
      throw new Error(`Document record error: ${documentError.message}`);
    }
    
    console.log('PDF uploaded successfully!');
    
    return new Response(JSON.stringify({
      success: true,
      document: documentData
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
