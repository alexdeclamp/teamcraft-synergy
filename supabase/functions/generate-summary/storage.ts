
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
  
  const { data: saveData, error: saveError } = await supabase
    .from('note_summaries')
    .upsert({
      note_id: noteId,
      project_id: projectId,
      user_id: userId,
      summary: summary,
      updated_at: new Date().toISOString()
    }, { onConflict: 'note_id' })
    .select();
  
  if (saveError) {
    console.error('Error saving note summary:', saveError);
    throw saveError;
  } else {
    console.log('Note summary saved successfully:', saveData);
  }
}

// Save image summary to database
export async function saveImageSummary(
  imageUrl: string, 
  projectId: string, 
  userId: string, 
  summary: string
): Promise<void> {
  const supabase = getSupabaseClient();
  
  const { data: saveData, error: saveError } = await supabase
    .from('image_summaries')
    .upsert({
      image_url: imageUrl,
      project_id: projectId,
      user_id: userId,
      summary: summary,
      updated_at: new Date().toISOString()
    }, { onConflict: 'image_url' })
    .select();
  
  if (saveError) {
    console.error('Error saving image summary:', saveError);
    throw saveError;
  } else {
    console.log('Image summary saved successfully:', saveData);
  }
}
