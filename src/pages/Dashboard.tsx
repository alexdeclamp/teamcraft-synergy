
import React from 'react';
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
