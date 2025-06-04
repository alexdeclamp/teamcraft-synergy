
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProjectPageData } from '@/hooks/useProjectPageData';
import ProjectLayout from '@/components/project/ProjectLayout';

const Project = () => {
  const { id } = useParams<{ id: string }>();
  // Par défaut, on arrive sur le chat (overview devient chat-centric)
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
    noteCount,
    documentCount,
    recentUpdatesCount,
    formatFileSize,
    handleImagesUpdated,
    handleAddMember,
    fetchProjectImages,
    showInviteDialog,
    setShowInviteDialog,
    refreshProjectStats
  } = useProjectPageData(id);

  // Update members when they're fetched
  useEffect(() => {
    if (fetchedMembers.length > 0) {
      setMembers(fetchedMembers);
    }
  }, [fetchedMembers]);

  // Fetch images when the project loads
  useEffect(() => {
    if (project && id) {
      fetchProjectImages();
    }
  }, [project, id, fetchProjectImages]);

  // Handle tab change - le chat reste toujours la base
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    
    // Refresh project statistics when returning to overview/chat
    if (newTab === 'overview') {
      refreshProjectStats();
    }
  };

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
      noteCount={noteCount}
      documentCount={documentCount}
      recentUpdatesCount={recentUpdatesCount}
      formatFileSize={formatFileSize}
      handleImagesUpdated={handleImagesUpdated}
      handleAddMember={handleAddMember}
      activeTab={activeTab}
      setActiveTab={handleTabChange}
      showInviteDialog={showInviteDialog}
      setShowInviteDialog={setShowInviteDialog}
    />
  );
};

export default Project;
