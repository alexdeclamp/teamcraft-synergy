
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
  
  // Get subscription data to trigger refresh when arriving from payment
  const { refetch: refetchSubscription } = useSubscription();

  // Check URL parameters for subscription status
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const subscriptionStatus = queryParams.get('subscription');

  useEffect(() => {
    if (subscriptionStatus === 'success') {
      console.log('Dashboard detected successful payment redirect');
      
      // If we haven't shown the loading toast yet, show it
      toast.loading('Processing your subscription upgrade...', { 
        id: 'subscription-update',
        duration: 8000
      });
      
      // Clear the URL parameters
      const url = new URL(window.location.href);
      url.searchParams.delete('subscription');
      window.history.replaceState({}, '', url.toString());
      
      // Trigger an immediate subscription refresh
      refetchSubscription();
    } else if (subscriptionStatus === 'canceled') {
      toast.info('Subscription upgrade was canceled.', { duration: 4000 });
      
      // Clear the URL parameters
      const url = new URL(window.location.href);
      url.searchParams.delete('subscription');
      window.history.replaceState({}, '', url.toString());
    }
  }, [subscriptionStatus, refetchSubscription]);

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
