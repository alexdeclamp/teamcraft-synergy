
import { validateRequestParams, logApiUsage, corsHeaders } from "./utils.ts";
import { processImage } from "./imageProcessor.ts";
import { processText } from "./textProcessor.ts";
import { saveNoteSummary, saveImageSummary } from "./storage.ts";

// Main request handler
export async function handleRequest(req: Request): Promise<Response> {
  try {
    const reqBody = await req.json();
    const { type, content, projectId, userId, noteId, imageUrl } = validateRequestParams(reqBody);
    
    // Log the OpenAI API call
    await logApiUsage(userId);
    
    // Generate summary based on content type
    console.log('Generating summary for:', type);
    let summary: string;
    
    if (type === 'image') {
      summary = await processImage(imageUrl);
      await saveImageSummary(imageUrl, projectId, userId, summary);
    } else {
      summary = await processText(content);
      await saveNoteSummary(noteId, projectId, userId, summary);
    }
    
    console.log('Generated summary:', summary);
    
    // Return the generated summary
    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Error in handleRequest:', error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error in request handler' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
