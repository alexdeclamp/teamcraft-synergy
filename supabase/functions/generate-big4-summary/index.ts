
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../generate-summary/utils.ts";
import { openAIApiKey, anthropicApiKey } from "../generate-summary/utils.ts";

interface Big4Summary {
  executiveSummary: string;
  description: string;
  keyLearnings: string[];
  blockers: string[] | null;
  nextSteps: string[];
}

interface RequestData {
  content: string;
  fileName?: string;
  model?: 'claude' | 'openai';
}

async function generateWithClaude(content: string, fileName?: string): Promise<Big4Summary> {
  const promptTemplate = `
You are an expert consultant tasked with creating a structured "Big 4 Summary" of the following document or text content. 
Your summary should follow the BCG consulting format with these main sections:

1. Executive Summary (2-3 sentences that capture the main point)
2. Description (A brief overview of what the document covers)
3. Key Learnings (3-5 bullet points of the most important takeaways)
4. Blockers (If any, 1-3 issues or challenges mentioned in the document)
5. Next Steps (3-5 recommended actions based on the document)

Format your response as a structured JSON object with these sections. For the Key Learnings, Blockers, and Next Steps, 
provide arrays of strings with each point as a separate string.

If no blockers are mentioned or implied in the document, return null for the blockers array.

Here is the content to summarize:

${content}

Analyze this content carefully and create a professional "Big 4 Summary" that would be suitable for executive review.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 2000,
        temperature: 0.2,
        system: "You are a professional business consultant who creates executive summaries in JSON format. Always respond with valid JSON.",
        messages: [{ role: "user", content: promptTemplate }],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Claude API error:", response.status, errorText);
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    const contentJson = JSON.parse(data.content[0].text);
    
    return {
      executiveSummary: contentJson.executiveSummary,
      description: contentJson.description,
      keyLearnings: contentJson.keyLearnings,
      blockers: contentJson.blockers,
      nextSteps: contentJson.nextSteps
    };
  } catch (error) {
    console.error("Error in Claude processing:", error);
    throw error;
  }
}

async function generateWithOpenAI(content: string, fileName?: string): Promise<Big4Summary> {
  const promptTemplate = `
Create a structured "Big 4 Summary" of the following document or text content in the BCG consulting format with these main sections:

1. Executive Summary (2-3 sentences that capture the main point)
2. Description (A brief overview of what the document covers)
3. Key Learnings (3-5 bullet points of the most important takeaways)
4. Blockers (If any, 1-3 issues or challenges mentioned in the document)
5. Next Steps (3-5 recommended actions based on the document)

Format your response as a structured JSON object with these sections. For the Key Learnings, Blockers, and Next Steps, 
provide arrays of strings with each point as a separate string.

If no blockers are mentioned or implied in the document, return null for the blockers array.

Here is the content to summarize:
${content}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a professional business consultant who creates executive summaries in JSON format. Always respond with valid JSON."
          },
          {
            role: "user",
            content: promptTemplate
          }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const contentJson = JSON.parse(data.choices[0].message.content);
    
    return {
      executiveSummary: contentJson.executiveSummary,
      description: contentJson.description,
      keyLearnings: contentJson.keyLearnings,
      blockers: contentJson.blockers,
      nextSteps: contentJson.nextSteps
    };
  } catch (error) {
    console.error("Error in OpenAI processing:", error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const { content, fileName, model = 'claude' } = await req.json() as RequestData;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No content provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing content for Big 4 Summary using ${model}`);
    console.log(`Content length: ${content.length} characters`);

    let summary: Big4Summary;

    if (model === 'claude') {
      summary = await generateWithClaude(content, fileName);
    } else {
      summary = await generateWithOpenAI(content, fileName);
    }

    return new Response(
      JSON.stringify({ success: true, summary }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate Big 4 Summary", 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
