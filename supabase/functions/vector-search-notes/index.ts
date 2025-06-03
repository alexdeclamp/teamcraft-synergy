
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🚀 Vector search function called:', req.method);
  
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📥 Parsing request body...');
    const { query, projectId, searchType = 'semantic', textQuery = '', limit = 10 } = await req.json();

    console.log('📋 Request parameters:', {
      query,
      projectId,
      searchType,
      textQuery,
      limit,
      hasOpenAIKey: !!openAIApiKey,
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey
    });

    if (!query) {
      console.log('❌ No query provided');
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!openAIApiKey) {
      console.log('❌ OpenAI API key not found');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🤖 Generating embedding for query...');
    // Generate embedding for the query
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: query,
        encoding_format: 'float'
      }),
    });

    if (!embeddingResponse.ok) {
      const errorText = await embeddingResponse.text();
      console.log('❌ OpenAI embedding error:', errorText);
      throw new Error(`Failed to generate query embedding: ${errorText}`);
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;
    console.log('✅ Embedding generated, length:', queryEmbedding.length);

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    let results;
    
    if (searchType === 'hybrid') {
      console.log('🔍 Running hybrid search...');
      // Use hybrid search function
      const { data, error } = await supabase.rpc('hybrid_search_notes', {
        query_embedding: queryEmbedding,
        search_text: textQuery,
        project_filter: projectId || null,
        match_count: limit
      });
      
      if (error) {
        console.log('❌ Hybrid search error:', error);
        throw error;
      }
      results = data;
    } else {
      console.log('🔍 Running semantic search...');
      // Use semantic search function
      const { data, error } = await supabase.rpc('find_similar_notes', {
        query_embedding: queryEmbedding,
        project_filter: projectId || null,
        match_count: limit
      });
      
      if (error) {
        console.log('❌ Semantic search error:', error);
        throw error;
      }
      results = data;
    }

    console.log('✅ Search completed:', {
      resultCount: results?.length || 0,
      firstResult: results?.[0] ? {
        id: results[0].id,
        title: results[0].title,
        similarity: results[0].similarity
      } : null
    });

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in vector search:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
