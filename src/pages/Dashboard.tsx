
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardToolbar from '@/components/dashboard/DashboardToolbar';
import ProjectGrid from '@/components/dashboard/ProjectGrid';
import { useDashboardData } from '@/hooks/useDashboardData';

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

  // Check URL parameters for subscription status
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const subscriptionStatus = queryParams.get('subscription');

  useEffect(() => {
    if (subscriptionStatus === 'success') {
      toast.success(
        'Payment successful! Your subscription will be upgraded once the payment is processed.',
        { duration: 6000 }
      );
    } else if (subscriptionStatus === 'canceled') {
      toast.info('Subscription upgrade was canceled.', { duration: 4000 });
    }
  }, [subscriptionStatus]);

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
