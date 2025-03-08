
import { getSupabaseClient } from "./utils.ts";

// Save note summary to database
export async function saveNoteSummary(
  noteId: string, 
  projectId: string, 
  userId: string, 
  summary: string
): Promise<void> {
  console.log('Saving note summary to database');
  const supabase = getSupabaseClient();
  
  // First check if the record exists
  const { data: existingData, error: lookupError } = await supabase
    .from('note_summaries')
    .select('id')
    .eq('note_id', noteId)
    .maybeSingle();
  
  if (lookupError) {
    console.error('Error checking for existing note summary:', lookupError);
    throw lookupError;
  }
  
  let result;
  if (existingData?.id) {
    // Update existing record
    result = await supabase
      .from('note_summaries')
      .update({
        summary: summary,
        updated_at: new Date().toISOString()
      })
      .eq('note_id', noteId);
  } else {
    // Insert new record
    result = await supabase
      .from('note_summaries')
      .insert({
        note_id: noteId,
        project_id: projectId,
        user_id: userId,
        summary: summary,
        updated_at: new Date().toISOString()
      });
  }
  
  if (result.error) {
    console.error('Error saving note summary:', result.error);
    throw result.error;
  } else {
    console.log('Note summary saved successfully');
  }
}

// Save image summary to database
export async function saveImageSummary(
  imageUrl: string, 
  projectId: string, 
  userId: string, 
  summary: string
): Promise<void> {
  console.log('Saving image summary to database');
  const supabase = getSupabaseClient();
  
  // First check if the record exists
  const { data: existingData, error: lookupError } = await supabase
    .from('image_summaries')
    .select('id')
    .eq('image_url', imageUrl)
    .eq('project_id', projectId)
    .maybeSingle();
  
  if (lookupError) {
    console.error('Error checking for existing image summary:', lookupError);
    throw lookupError;
  }
  
  let result;
  if (existingData?.id) {
    // Update existing record
    result = await supabase
      .from('image_summaries')
      .update({
        summary: summary,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingData.id);
  } else {
    // Insert new record
    result = await supabase
      .from('image_summaries')
      .insert({
        image_url: imageUrl,
        project_id: projectId,
        user_id: userId,
        summary: summary,
        updated_at: new Date().toISOString()
      });
  }
  
  if (result.error) {
    console.error('Error saving image summary:', result.error);
    throw result.error;
  } else {
    console.log('Image summary saved successfully');
  }
}
