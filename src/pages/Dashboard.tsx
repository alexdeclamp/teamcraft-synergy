
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardToolbar from '@/components/dashboard/DashboardToolbar';
import ProjectGrid from '@/components/dashboard/ProjectGrid';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useSubscription } from '@/hooks/useSubscription';

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
  
  // Get subscription data to trigger active processing of URL parameters
  const { refetch: refetchSubscription } = useSubscription();
  
  // Check URL parameters for subscription status
  const location = useLocation();
  
  useEffect(() => {
    // Force an immediate subscription check when Dashboard loads
    const queryParams = new URLSearchParams(location.search);
    const subscriptionStatus = queryParams.get('subscription');
    const sessionId = queryParams.get('session_id');
    
    if (subscriptionStatus === 'success') {
      console.log('Dashboard detected successful checkout completion');
      
      if (sessionId) {
        console.log('Session ID detected:', sessionId);
      }
      
      // Trigger an immediate subscription refresh - this will process URL parameters
      refetchSubscription();
    }
  }, [location.search, refetchSubscription]);

  return (
    <div className="min-h-screen bg-background pb-12 animate-fade-in">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <DashboardHeader />
        
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
