
import { supabase } from '@/integrations/supabase/client';

/**
 * Check if the user has created a brain (project)
 */
export const checkBrainCreation = async (userId: string): Promise<boolean> => {
  const { data: projects } = await supabase
    .from('projects')
    .select('id')
    .eq('owner_id', userId)
    .limit(1);
  
  return !!projects && projects.length > 0;
};

/**
 * Check if notes have been added to the project
 */
export const checkNotesAdded = async (projectId: string): Promise<boolean> => {
  const { data: notes } = await supabase
    .from('project_notes')
    .select('id')
    .eq('project_id', projectId)
    .limit(1);
  
  return !!notes && notes.length > 0;
};

/**
 * Check if documents or images have been added to the project
 */
export const checkDocumentsAdded = async (projectId: string): Promise<boolean> => {
  const { data: documents } = await supabase
    .from('project_documents')
    .select('id')
    .eq('project_id', projectId)
    .limit(1);
  
  return !!documents && documents.length > 0;
};

/**
 * Check if other members have been added to the project
 */
export const checkMembersAdded = async (projectId: string, currentUserId: string): Promise<boolean> => {
  const { data: members } = await supabase
    .from('project_members')
    .select('id')
    .eq('project_id', projectId)
    .neq('user_id', currentUserId)
    .limit(1);
  
  return !!members && members.length > 0;
};

/**
 * Gets the first project ID for a user
 */
export const getUserProjectId = async (userId: string): Promise<string | null> => {
  const { data: projects } = await supabase
    .from('projects')
    .select('id')
    .eq('owner_id', userId)
    .limit(1);
  
  return projects && projects.length > 0 ? projects[0].id : null;
};
