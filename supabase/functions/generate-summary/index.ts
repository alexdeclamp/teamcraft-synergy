
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { type, content, imageUrl } = await req.json();
    
    console.log(`Processing ${type} summary request`);
    if (type === 'image') {
      console.log(`Image URL: ${imageUrl}`);
    }
    
    let prompt = '';
    let messages = [];
    
    if (type === 'note') {
      prompt = `
      You are a project manager and data protection officer. Create a concise summary of the following project note.
      Focus on key elements, main takeaways, and important learnings that would help someone remember what this note was about.
      Make your summary professional, clear, and highlight any action items or decisions if present.
      
      NOTE CONTENT:
      ${content}
      `;
      
      messages = [
        { role: 'system', content: 'You are a professional project manager and data protection officer assistant that specializes in creating concise summaries of project materials.' },
        { role: 'user', content: prompt }
      ];
    } else if (type === 'image') {
      // For images, we'll use GPT-4's vision capabilities with the correct format
      messages = [
        {
          role: 'system',
          content: 'You are a professional project manager and data protection officer assistant that specializes in describing project-related images accurately. When describing images, focus on factual details rather than making assumptions.'
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Please provide a concise, accurate description of this project-related image. Focus only on what you can clearly see in the image. If the image is not clear or you cannot identify key elements, state that directly. Do not make assumptions about the purpose or context if they are not visually apparent.' },
            { type: 'image_url', url: imageUrl }
          ]
        }
      ];
    } else {
      throw new Error('Invalid summary type requested');
    }

    console.log('Sending request to OpenAI API with messages:', JSON.stringify(messages));

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: type === 'image' ? 'gpt-4o' : 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error response:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const summary = data.choices[0].message.content;

    console.log('Generated summary:', summary);

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-summary function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
