
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface ImageTag {
  id: string;
  tag: string;
}

export type SortOption = 'a-z' | 'z-a' | 'newest' | 'oldest';

export function useImageTags(imageUrl: string, projectId: string | undefined) {
  const [tags, setTags] = useState<ImageTag[]>([]);
  const [filteredTags, setFilteredTags] = useState<ImageTag[]>([]);
  const [filterText, setFilterText] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('a-z');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Fetch tags whenever imageUrl or projectId changes
  useEffect(() => {
    if (imageUrl && projectId) {
      fetchImageTags();
    }
  }, [imageUrl, projectId]);

  // Apply filtering and sorting whenever tags, filterText, or sortOption changes
  useEffect(() => {
    let result = [...tags];
    
    // Apply filter
    if (filterText) {
      result = result.filter(tag => 
        tag.tag.toLowerCase().includes(filterText.toLowerCase())
      );
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'a-z':
        result = result.sort((a, b) => a.tag.localeCompare(b.tag));
        break;
      case 'z-a':
        result = result.sort((a, b) => b.tag.localeCompare(a.tag));
        break;
      case 'newest':
        // We don't have a created_at field in our data model, so we'll use the array order
        // which is already sorted by most recently added (since we add new tags to the beginning)
        break;
      case 'oldest':
        // Reverse the array for oldest first
        result = [...result].reverse();
        break;
    }
    
    setFilteredTags(result);
  }, [tags, filterText, sortOption]);

  const fetchImageTags = async () => {
    try {
      console.log('Fetching tags for image:', imageUrl);
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('image_tags')
        .select('id, tag')
        .eq('image_url', imageUrl)
        .eq('project_id', projectId);

      if (error) {
        console.error('Error fetching image tags:', error);
        return;
      }

      console.log('Image tags data:', data);
      
      if (data) {
        // Ensure data is of the right type by mapping it
        const typedTags: ImageTag[] = data.map(item => ({
          id: item.id,
          tag: item.tag
        }));
        setTags(typedTags);
      }
    } catch (error) {
      console.error('Error checking for existing tags:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = async (newTag: string) => {
    if (!newTag.trim() || !projectId || !user) return;
    
    try {
      console.log('Adding new tag:', newTag.trim());
      console.log('For image:', imageUrl);
      console.log('In project:', projectId);
      
      const { data, error } = await supabase
        .from('image_tags')
        .insert({
          project_id: projectId,
          image_url: imageUrl,
          tag: newTag.trim(),
          user_id: user.id
        })
        .select('id, tag')
        .single();

      if (error) {
        console.error('Error adding tag:', error);
        toast.error('Failed to add tag');
        return;
      }

      console.log('Tag added successfully:', data);
      
      // Ensure the new tag has the correct type
      const newTagObject: ImageTag = {
        id: data.id,
        tag: data.tag
      };
      
      setTags([...tags, newTagObject]);
      toast.success('Tag added successfully');
      return true;
    } catch (error) {
      console.error('Error adding tag:', error);
      toast.error('Failed to add tag');
      return false;
    }
  };

  const removeTag = async (tagId: string) => {
    try {
      console.log('Removing tag with ID:', tagId);
      
      const { error } = await supabase
        .from('image_tags')
        .delete()
        .eq('id', tagId);

      if (error) {
        console.error('Error removing tag:', error);
        toast.error('Failed to remove tag');
        return false;
      }

      setTags(tags.filter(tag => tag.id !== tagId));
      toast.success('Tag removed successfully');
      return true;
    } catch (error) {
      console.error('Error removing tag:', error);
      toast.error('Failed to remove tag');
      return false;
    }
  };

  return {
    tags,
    filteredTags,
    isLoading,
    filterText,
    setFilterText,
    sortOption,
    setSortOption,
    addTag,
    removeTag,
    refreshTags: fetchImageTags
  };
}
