
import { validateRequestParams, logApiUsage, corsHeaders } from "./utils.ts";
import { processImage } from "./imageProcessor.ts";
import { processText } from "./textProcessor.ts";
import { saveNoteSummary, saveImageSummary } from "./storage.ts";

// Main request handler
export async function handleRequest(req: Request): Promise<Response> {
  try {
    // Parse request body with error handling
    let reqBody;
    try {
      reqBody = await req.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Validate parameters
    let type, content, projectId, userId, noteId, imageUrl;
    try {
      const params = validateRequestParams(reqBody);
      type = params.type;
      content = params.content;
      projectId = params.projectId;
      userId = params.userId;
      noteId = params.noteId;
      imageUrl = params.imageUrl;
    } catch (validationError: any) {
      console.error('Validation error:', validationError.message);
      return new Response(JSON.stringify({ error: validationError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Log the OpenAI API call
    try {
      await logApiUsage(userId);
    } catch (logError: any) {
      console.warn('Error logging API usage (non-fatal):', logError.message);
      // Continue execution even if logging fails
    }
    
    // Generate summary based on content type
    console.log('Generating summary for:', type);
    let summary: string;
    
    try {
      if (type === 'image') {
        summary = await processImage(imageUrl);
        await saveImageSummary(imageUrl, projectId, userId, summary);
      } else {
        summary = await processText(content);
        await saveNoteSummary(noteId, projectId, userId, summary);
      }
    } catch (processingError: any) {
      console.error('Error in processing:', processingError);
      return new Response(JSON.stringify({ error: processingError.message || 'Error generating summary' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log('Generated summary:', summary);
    
    // Return the generated summary
    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error: any) {
    console.error('Error in handleRequest:', error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error in request handler' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
