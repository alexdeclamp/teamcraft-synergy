
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProjectPageData } from '@/hooks/useProjectPageData';
import ProjectLayout from '@/components/project/ProjectLayout';

const Project = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const [members, setMembers] = useState<any[]>([]);
  
  const {
    loading,
    project,
    members: fetchedMembers,
    userRole,
    projectImages,
    recentImages,
    isImagesLoading,
    daysSinceCreation,
    activityPercentage,
    formatFileSize,
    handleImagesUpdated,
    handleAddMember,
    fetchProjectImages
  } = useProjectPageData(id);

  // Update members when they're fetched
  useEffect(() => {
    if (fetchedMembers.length > 0) {
      setMembers(fetchedMembers);
    }
  }, [fetchedMembers]);

  // Fetch images when the project loads
  useEffect(() => {
    if (project && id && !isImagesLoading && projectImages.length === 0) {
      fetchProjectImages();
    }
  }, [project, id, fetchProjectImages, isImagesLoading, projectImages.length]);

  return (
    <ProjectLayout
      loading={loading}
      project={project}
      members={members}
      setMembers={setMembers}
      userRole={userRole}
      projectImages={projectImages}
      recentImages={recentImages}
      isImagesLoading={isImagesLoading}
      daysSinceCreation={daysSinceCreation}
      activityPercentage={activityPercentage}
      formatFileSize={formatFileSize}
      handleImagesUpdated={handleImagesUpdated}
      handleAddMember={handleAddMember}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    />
  );
};

export default Project;
