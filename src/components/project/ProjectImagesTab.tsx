
import React from 'react';
import ProjectImages from './ProjectImages';

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

interface ProjectImagesTabProps {
  projectId: string;
  images: UploadedImage[];
  isLoading: boolean;
  onImagesUpdated: (images: UploadedImage[]) => void;
  onUploadComplete: () => Promise<void>;
}

const ProjectImagesTab: React.FC<ProjectImagesTabProps> = ({
  projectId,
  images,
  isLoading,
  onImagesUpdated,
  onUploadComplete
}) => {
  return (
    <ProjectImages
      projectId={projectId}
      images={images}
      isLoading={isLoading}
      onImagesUpdated={onImagesUpdated}
      onUploadComplete={onUploadComplete}
    />
  );
};

export default ProjectImagesTab;
