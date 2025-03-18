
import { useState, useEffect } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardToolbar from '@/components/dashboard/DashboardToolbar';
import ProjectGrid from '@/components/dashboard/ProjectGrid';
import SubscriptionDashboard from '@/components/dashboard/SubscriptionDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProjectCardProps } from '@/components/project-card/ProjectCard';

const Dashboard = () => {
  const queryClient = useQueryClient();
  const [projects, setProjects] = useState<ProjectCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'owned' | 'member' | 'favorites' | 'archived'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');
  
  const handleProjectCreated = () => {
    // Invalidate projects cache to refetch the projects list
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    fetchProjects();
  };
  
  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      // Simulate fetching projects
      // In a real app, this would be replaced with your actual data fetching logic
      const mockProjects: ProjectCardProps[] = [
        // Add your mock projects here if needed for testing
      ];
      
      setProjects(mockProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProjects();
  }, [filter, sortOrder, searchTerm]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle filter change
  const handleFilterChange = (newFilter: 'all' | 'owned' | 'member' | 'favorites' | 'archived') => {
    setFilter(newFilter);
  };
  
  // Handle sort change
  const handleSortChange = (newSort: 'newest' | 'oldest' | 'alphabetical') => {
    setSortOrder(newSort);
  };
  
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <DashboardHeader className="" />
      
      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>
        
        <TabsContent value="projects" className="space-y-6">
          <DashboardToolbar 
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            filter={filter}
            onFilterChange={handleFilterChange}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
          />
          <ProjectGrid 
            projects={projects}
            loading={loading}
            searchTerm={searchTerm}
            filter={filter}
            refreshProjects={fetchProjects}
          />
        </TabsContent>
        
        <TabsContent value="subscription">
          <SubscriptionDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
