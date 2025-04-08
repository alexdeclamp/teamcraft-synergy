
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, createErrorResponse, createSuccessResponse } from "./utils.ts";
import { 
  fetchPageDetails, 
  fetchPageBlocks, 
  verifyProjectAccess, 
  getNotionAccessToken 
} from "./notionApi.ts";
import { extractPageTitle, processBlocksRecursively } from "./contentProcessor.ts";
import { saveNotionPageAsNote } from "./saveToDatabase.ts";

// Process a single Notion page and save it as a note
async function processPage(
  supabase: any, 
  pageId: string, 
  projectId: string, 
  userId: string, 
  accessToken: string
) {
  try {
    // Fetch page details and blocks from Notion
    const pageData = await fetchPageDetails(pageId, accessToken);
    const blocksData = await fetchPageBlocks(pageId, accessToken);
    
    // Extract page title from the data
    const pageTitle = extractPageTitle(pageData, blocksData);
    
    // Process blocks to extract content
    const content = await processBlocksRecursively(blocksData.results, accessToken);
    
    // Save the processed page as a note
    const noteData = await saveNotionPageAsNote(
      supabase, 
      pageTitle, 
      content, 
      projectId, 
      userId, 
      pageData,
      pageId
    );
    
    return {
      success: true,
      noteId: noteData.id,
      pageId: pageId,
      title: pageTitle
    };
  } catch (error) {
    console.error(`Error processing page ${pageId}:`, error);
    return {
      success: false,
      pageId: pageId,
      error: error.message || "Unknown error occurred"
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, pageIds, projectId } = await req.json();
    
    // Check if this is a batch import or single import
    const isBatchImport = Array.isArray(pageIds) && pageIds.length > 0;
    const singlePageId = !isBatchImport ? pageIds : null;
    
    if (!userId || (!isBatchImport && !singlePageId) || !projectId) {
      throw new Error("Missing required parameters: userId, pageId(s), and projectId");
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verify project access
    await verifyProjectAccess(supabase, projectId, userId);
    
    // Get Notion access token
    const accessToken = await getNotionAccessToken(supabase, userId);
    
    // Handle single page import (backward compatibility)
    if (!isBatchImport) {
      // Re-use existing single page import logic
      const result = await processPage(supabase, singlePageId, projectId, userId, accessToken);
      
      if (!result.success) {
        throw new Error(`Failed to import page: ${result.error}`);
      }
      
      // Return success response with single note data
      return createSuccessResponse({
        note: result,
        message: `Successfully imported "${result.title}" from Notion`,
      });
    }
    
    // Handle batch import
    console.log(`Processing batch import of ${pageIds.length} pages`);
    
    const results = [];
    let successCount = 0;
    
    // Process each page sequentially to avoid rate limiting
    for (const pageId of pageIds) {
      const result = await processPage(supabase, pageId, projectId, userId, accessToken);
      results.push(result);
      
      if (result.success) {
        successCount++;
      }
    }
    
    // Return success response with batch results
    return createSuccessResponse({
      batchResults: results,
      successCount: successCount,
      totalCount: pageIds.length,
      message: `Successfully imported ${successCount} of ${pageIds.length} pages from Notion`,
    });
    
  } catch (error) {
    return createErrorResponse(error.message || "Unknown error occurred");
  }
});
