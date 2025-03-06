
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import ProjectImageUpload from '@/components/ProjectImageUpload';
import ProjectImagesList from './ProjectImagesList';
import { useAuth } from '@/contexts/AuthContext';

interface UploadedImage {
  url: string;
  path: string;
  size: number;
  name: string;
  createdAt: Date;
  summary?: string;
  is_favorite?: boolean;
  is_important?: boolean;
  is_archived?: boolean;
}

interface ProjectImagesProps {
  projectId: string;
  images: UploadedImage[];
  isLoading: boolean;
  onImagesUpdated: (images: UploadedImage[]) => void;
  onUploadComplete: () => Promise<void>;
}

const ProjectImages: React.FC<ProjectImagesProps> = ({ 
  projectId, 
  images,
  isLoading,
  onImagesUpdated,
  onUploadComplete
}) => {
  const { user } = useAuth();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Images</CardTitle>
        <CardDescription>
          Upload and manage images for this project
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ProjectImageUpload 
          projectId={projectId} 
          onUploadComplete={onUploadComplete}
        />
        
        <ProjectImagesList
          projectId={projectId}
          images={images}
          onImagesUpdated={onImagesUpdated}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
};

export default ProjectImages;
