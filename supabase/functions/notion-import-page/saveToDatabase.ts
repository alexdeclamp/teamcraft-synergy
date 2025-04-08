
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Save the processed Notion page as a note in the database
export async function saveNotionPageAsNote(
  supabase: any,
  pageTitle: string, 
  content: string, 
  projectId: string, 
  userId: string, 
  pageData: any,
  pageId: string
) {
  const { data: noteData, error: noteError } = await supabase
    .from('project_notes')
    .insert({
      title: pageTitle,
      content: content.trim(),
      project_id: projectId,
      user_id: userId,
      tags: ['notion', 'imported', 'notion-import'],
      source_document: {
        type: 'notion',
        url: pageData.url,
        name: pageTitle,
        id: pageId
      }
    })
    .select()
    .single();
  
  if (noteError) {
    console.error("Error creating note:", noteError);
    throw new Error(`Failed to create note: ${noteError.message}`);
  }
  
  return noteData;
}
