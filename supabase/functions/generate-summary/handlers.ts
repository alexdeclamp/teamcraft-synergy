
import { validateRequestParams, logApiUsage, corsHeaders } from "./utils.ts";
import { processImage } from "./imageProcessor.ts";
import { processText } from "./textProcessor.ts";
import { saveNoteSummary, saveImageSummary } from "./storage.ts";

// Main request handler
export async function handleRequest(req: Request): Promise<Response> {
  const { type, content, projectId, userId, noteId, imageUrl } = await parseAndValidateRequest(req);
  
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
  });
}

// Parse and validate the request body
async function parseAndValidateRequest(req: Request) {
  const reqBody = await req.json();
  return validateRequestParams(reqBody);
}
