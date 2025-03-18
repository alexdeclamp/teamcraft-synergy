
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardToolbar from '@/components/dashboard/DashboardToolbar';
import ProjectGrid from '@/components/dashboard/ProjectGrid';
import { useDashboardData } from '@/hooks/useDashboardData';
import SubscriptionInfo from '@/components/subscription/SubscriptionInfo';
import { useSubscription } from '@/hooks/useSubscription';
import { getUserStats } from '@/components/navbar/ProfileDialog';

const Dashboard = () => {
  const {
    filteredProjects,
    loading,
    searchTerm,
    filter,
    sortOrder,
    setSearchTerm,
    setFilter,
    setSortOrder,
    refreshProjects
  } = useDashboardData();
  
  const { planDetails, isLoading: subscriptionLoading, error: subscriptionError } = useSubscription();
  const [userStats, setUserStats] = useState({
    apiCalls: 0,
    ownedBrains: 0,
    sharedBrains: 0,
    documents: 0
  });

  // Update stats whenever the component renders or projects refresh
  useEffect(() => {
    // Get the latest user stats from the global state
    const stats = getUserStats();
    setUserStats(stats);
  }, [filteredProjects]);

  // Calculate totals for dashboard display
  const totalBrains = userStats.ownedBrains + userStats.sharedBrains;
  const totalDocuments = userStats.documents;
  const apiCallsUsed = userStats.apiCalls;

  return (
    <div className="min-h-screen bg-background pb-12 animate-fade-in">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <DashboardHeader />
        
        <SubscriptionInfo 
          planDetails={planDetails} 
          isLoading={subscriptionLoading} 
          error={subscriptionError}
          userBrainCount={totalBrains}
          userDocumentCount={totalDocuments}
          apiCallsUsed={apiCallsUsed}
        />
        
        <DashboardToolbar
          searchTerm={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          filter={filter}
          onFilterChange={setFilter}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
        />
        
        <ProjectGrid
          projects={filteredProjects}
          loading={loading}
          searchTerm={searchTerm}
          filter={filter}
          refreshProjects={refreshProjects}
        />
      </main>
    </div>
  );
};

export default Dashboard;
