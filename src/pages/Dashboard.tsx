
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardToolbar from '@/components/dashboard/DashboardToolbar';
import ProjectGrid from '@/components/dashboard/ProjectGrid';
import SubscriptionDashboard from '@/components/dashboard/SubscriptionDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQueryClient } from '@tanstack/react-query';

const Dashboard = () => {
  const queryClient = useQueryClient();
  
  const handleProjectCreated = () => {
    // Invalidate projects cache to refetch the projects list
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  };
  
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <DashboardHeader onProjectCreated={handleProjectCreated} />
      
      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>
        
        <TabsContent value="projects" className="space-y-6">
          <DashboardToolbar />
          <ProjectGrid />
        </TabsContent>
        
        <TabsContent value="subscription">
          <SubscriptionDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
