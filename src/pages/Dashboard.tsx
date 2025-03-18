
import React from 'react';
import Navbar from '@/components/Navbar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardToolbar from '@/components/dashboard/DashboardToolbar';
import ProjectGrid from '@/components/dashboard/ProjectGrid';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

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
        
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">
                View your subscription details and usage limits
              </p>
              <Link to="/subscription">
                <Button variant="outline" size="sm" className="gap-1">
                  <CreditCard className="h-4 w-4" />
                  View Subscription
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
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
