
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { noteContent, type, model = 'claude' } = await req.json();
    
    if (!noteContent) {
      return new Response(
        JSON.stringify({ error: 'Note content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!type || !['title', 'tags', 'both'].includes(type)) {
      return new Response(
        JSON.stringify({ error: 'Valid type is required (title, tags, or both)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Regenerating note ${type} using ${model} model`);
    
    let prompt = '';
    if (type === 'title' || type === 'both') {
      prompt += 'Generate a concise, descriptive title for this note content. The title should be no more than 7 words.\n\n';
    }
    
    if (type === 'tags' || type === 'both') {
      prompt += 'Generate between 3-5 relevant tags for this note content. Each tag should be a single word or short phrase without spaces. Do not include hash symbols.\n\n';
    }
    
    prompt += `Here is the note content:\n${noteContent}`;

    let result;
    if (model === 'claude') {
      if (!anthropicApiKey) {
        return new Response(
          JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Claude API error: ${response.status}. Details: ${errorText}`);
      }
      
      const data = await response.json();
      result = data.content[0].text;
    } else {
      if (!openaiApiKey) {
        return new Response(
          JSON.stringify({ error: 'OPENAI_API_KEY is not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a helpful assistant that generates titles and tags for notes based on their content.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 150,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status}. Details: ${errorText}`);
      }
      
      const data = await response.json();
      result = data.choices[0].message.content;
    }

    // Process the result
    let response;
    if (type === 'title') {
      // Extract just the title (remove any explanations)
      const title = result.split('\n')[0].replace(/^(Title: |#+ )/, '').trim();
      response = { title };
    } else if (type === 'tags') {
      // Extract tags - first try to find a list of tags
      let tags = [];
      
      // Try to extract tags from bullet points or numbered list
      const tagLines = result.match(/[-*•].*?(?=\n|$)|\d+\..*?(?=\n|$)/g);
      
      if (tagLines && tagLines.length > 0) {
        tags = tagLines.map(line => line.replace(/^[-*•\d\.\s]+/, '').trim())
          .filter(tag => tag.length > 0);
      } else {
        // If no list found, try to extract comma-separated tags
        const tagText = result.replace(/^(Tags: |Tags )/, '').trim();
        tags = tagText.split(/,|\n/).map(tag => tag.trim())
          .filter(tag => tag.length > 0 && !tag.includes(':'));
      }
      
      // Clean up tags (remove hash symbols, quotes, etc.)
      tags = tags.map(tag => tag.replace(/^#/, '').replace(/['"]/g, '').trim());
      
      response = { tags };
    } else {
      // For 'both', extract both title and tags
      const lines = result.split('\n').filter(line => line.trim());
      
      // First non-empty line is likely the title
      const title = lines[0].replace(/^(Title: |#+ )/, '').trim();
      
      // Extract tags - either from bullet points or comma-separated
      let tags = [];
      const tagContent = lines.slice(1).join('\n');
      
      // Try to extract tags from bullet points or numbered list
      const tagLines = tagContent.match(/[-*•].*?(?=\n|$)|\d+\..*?(?=\n|$)/g);
      
      if (tagLines && tagLines.length > 0) {
        tags = tagLines.map(line => line.replace(/^[-*•\d\.\s]+/, '').trim())
          .filter(tag => tag.length > 0);
      } else {
        // If no list found, try to extract comma-separated tags
        let tagText = '';
        for (const line of lines.slice(1)) {
          if (line.toLowerCase().includes('tag')) {
            tagText = line.replace(/^(Tags: |Tags )/, '').trim();
            break;
          }
        }
        
        if (!tagText) {
          // If no line with "tag" found, use all remaining lines
          tagText = lines.slice(1).join(' ');
        }
        
        tags = tagText.split(/,|\n/).map(tag => tag.trim())
          .filter(tag => tag.length > 0 && !tag.includes(':'));
      }
      
      // Clean up tags (remove hash symbols, quotes, etc.)
      tags = tags.map(tag => tag.replace(/^#/, '').replace(/['"]/g, '').trim());
      
      response = { title, tags };
    }

    return new Response(
      JSON.stringify({ success: true, ...response }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in regenerate-note-metadata function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        details: error.stack || '' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
