
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseImageManagementProps {
  projectId: string;
}

export function useImageManagement({ projectId }: UseImageManagementProps) {
  const [isRenaming, setIsRenaming] = useState(false);

  const renameImage = async (
    imagePath: string, 
    oldName: string, 
    newName: string
  ): Promise<boolean> => {
    if (!projectId || !imagePath || newName === oldName || !newName.trim()) {
      return false;
    }

    try {
      setIsRenaming(true);
      
      // Get the directory part of the path
      const pathParts = imagePath.split('/');
      const fileName = pathParts.pop() || '';
      const directory = pathParts.join('/');
      
      // Create new path with the new name
      // Preserve file extension
      const extension = fileName.includes('.') 
        ? `.${fileName.split('.').pop()}` 
        : '';
      const sanitizedNewName = newName.trim().replace(/[^\w\s.-]/g, '_');
      const newFileName = sanitizedNewName + extension;
      const newPath = `${directory}/${newFileName}`;
      
      // Copy the file to the new path
      const { data: copyData, error: copyError } = await supabase
        .storage
        .from('project_images')
        .copy(imagePath, newPath);
      
      if (copyError) throw copyError;
      
      // Update image tags to point to the new URL
      const { data: urlData } = await supabase
        .storage
        .from('project_images')
        .getPublicUrl(newPath);
      
      const { data: oldUrlData } = await supabase
        .storage
        .from('project_images')
        .getPublicUrl(imagePath);
      
      // Update any tags that reference this image
      const { error: tagUpdateError } = await supabase
        .from('image_tags')
        .update({ image_url: urlData.publicUrl })
        .eq('image_url', oldUrlData.publicUrl)
        .eq('project_id', projectId);
      
      if (tagUpdateError) {
        console.error('Error updating image tags:', tagUpdateError);
      }
      
      // Update any summaries that reference this image
      const { error: summaryUpdateError } = await supabase
        .from('image_summaries')
        .update({ image_url: urlData.publicUrl })
        .eq('image_url', oldUrlData.publicUrl)
        .eq('project_id', projectId);
      
      if (summaryUpdateError) {
        console.error('Error updating image summaries:', summaryUpdateError);
      }
      
      // Delete the original file
      const { error: deleteError } = await supabase
        .storage
        .from('project_images')
        .remove([imagePath]);
      
      if (deleteError) throw deleteError;
      
      toast.success('Image renamed successfully');
      return true;
    } catch (error: any) {
      console.error('Error renaming image:', error);
      toast.error('Failed to rename image');
      return false;
    } finally {
      setIsRenaming(false);
    }
  };

  return {
    isRenaming,
    renameImage
  };
}
