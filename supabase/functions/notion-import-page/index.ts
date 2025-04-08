
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, pageId, projectId } = await req.json();
    
    if (!userId || !pageId || !projectId) {
      throw new Error("Missing required parameters: userId, pageId, and projectId");
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verify project access
    await verifyProjectAccess(supabase, projectId, userId);
    
    // Get Notion access token
    const accessToken = await getNotionAccessToken(supabase, userId);
    
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
    
    // Return success response
    return createSuccessResponse({
      note: noteData,
      message: `Successfully imported "${pageTitle}" from Notion`,
    });
    
  } catch (error) {
    return createErrorResponse(error.message || "Unknown error occurred");
  }
});
