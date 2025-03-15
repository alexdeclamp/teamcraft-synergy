
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import ProjectImageUpload from '@/components/ProjectImageUpload';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Image } from 'lucide-react';

interface UploadedImage {
  url: string;
  path: string;
  size: number;
  name: string;
  createdAt: Date;
  summary?: string;
}

interface ProjectImagesProps {
  projectId: string;
  onImagesUpdated: (images: UploadedImage[], recentImages: UploadedImage[]) => void;
}

const ProjectImages: React.FC<ProjectImagesProps> = ({ projectId, onImagesUpdated }) => {
  const { user } = useAuth();
  const [isImagesLoading, setIsImagesLoading] = useState(false);

  // Fetch images when component mounts
  useEffect(() => {
    fetchProjectImages();
  }, [projectId]);

  const fetchProjectImages = async () => {
    if (!projectId || !user) return;

    try {
      setIsImagesLoading(true);
      
      const { data, error } = await supabase
        .storage
        .from('project_images')
        .list(`${projectId}`);

      if (error) throw error;

      if (data) {
        const imageUrls = await Promise.all(
          data.map(async (item) => {
            const { data: urlData } = await supabase
              .storage
              .from('project_images')
              .getPublicUrl(`${projectId}/${item.name}`);
            
            // Fetch summary if exists
            const { data: summaryData } = await supabase
              .from('image_summaries')
              .select('summary')
              .eq('image_url', urlData.publicUrl)
              .eq('project_id', projectId)
              .single();

            // Fetch tags if they exist
            const { data: tagsData } = await supabase
              .from('image_tags')
              .select('id, tag')
              .eq('image_url', urlData.publicUrl)
              .eq('project_id', projectId);

            return {
              url: urlData.publicUrl,
              path: `${projectId}/${item.name}`,
              size: item.metadata?.size || 0,
              name: item.name,
              createdAt: new Date(item.created_at || Date.now()),
              summary: summaryData?.summary || undefined,
              tags: tagsData || []
            };
          })
        );

        const sortedImages = imageUrls.sort((a, b) => 
          b.createdAt.getTime() - a.createdAt.getTime()
        );

        onImagesUpdated(sortedImages, sortedImages.slice(0, 3));
      }
    } catch (error: any) {
      console.error('Error fetching images:', error);
    } finally {
      setIsImagesLoading(false);
    }
  };

  const handleImageUploadComplete = async (imageUrl: string) => {
    // Refresh the project images
    await fetchProjectImages();
    toast.success('Image uploaded successfully');
  };

  return (
    <div className="border rounded-lg shadow-sm">
      <div className="flex items-center gap-2 p-4 border-b bg-muted/40">
        <Image className="h-5 w-5" />
        <h3 className="font-medium text-lg">Project Images</h3>
      </div>
      <div className="p-4 space-y-4">
        <ProjectImageUpload 
          projectId={projectId} 
          onUploadComplete={handleImageUploadComplete}
        />
      </div>
    </div>
  );
};

export default ProjectImages;
