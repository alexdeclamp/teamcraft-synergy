
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
  console.log(`Saving Notion page "${pageTitle}" as note...`);
  
  try {
    // Validate inputs
    if (!pageTitle || pageTitle.trim() === '') {
      throw new Error("Page title cannot be empty");
    }
    
    if (!content) {
      content = ""; // Default to empty string if no content
      console.log("Warning: Page content is empty");
    }
    
    if (!projectId) {
      throw new Error("Project ID cannot be empty");
    }
    
    if (!userId) {
      throw new Error("User ID cannot be empty");
    }
    
    // Prepare source document data
    const sourceDocument = {
      type: 'notion',
      url: pageData?.url || '',
      name: pageTitle,
      id: pageId
    };
    
    console.log(`Inserting note into database for project: ${projectId}, user: ${userId}`);
    
    const { data: noteData, error: noteError } = await supabase
      .from('project_notes')
      .insert({
        title: pageTitle,
        content: content.trim(),
        project_id: projectId,
        user_id: userId,
        tags: ['notion', 'imported', 'notion-import'],
        source_document: sourceDocument
      })
      .select()
      .single();
    
    if (noteError) {
      console.error("Error creating note:", noteError);
      throw new Error(`Failed to create note: ${noteError.message}`);
    }
    
    if (!noteData) {
      throw new Error("Note was created but no data was returned");
    }
    
    console.log(`Successfully created note with ID: ${noteData.id}`);
    return noteData;
  } catch (error) {
    console.error("Error in saveNotionPageAsNote:", error);
    throw error;
  }
}
