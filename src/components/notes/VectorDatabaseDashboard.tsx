
import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Database } from 'lucide-react';
import { useVectorStats } from './vector-database/useVectorStats';
import { useVectorNotes } from './vector-database/useVectorNotes';
import VectorOverviewTab from './vector-database/VectorOverviewTab';
import VectorDocumentsTab from './vector-database/VectorDocumentsTab';
import VectorAnalyticsTab from './vector-database/VectorAnalyticsTab';
import VectorToolsTab from './vector-database/VectorToolsTab';
import { VectorDatabaseDashboardProps } from './vector-database/types';

const VectorDatabaseDashboard: React.FC<VectorDatabaseDashboardProps> = ({ projectId }) => {
  const { stats, fetchVectorStats } = useVectorStats(projectId);
  const { notes, loading, fetchNotes } = useVectorNotes(projectId);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchVectorStats();
        await fetchNotes();
      } catch (error) {
        console.error('Error loading vector database data:', error);
      }
    };

    loadData();
  }, [fetchVectorStats, fetchNotes]);

  const handleRefresh = async () => {
    try {
      await fetchVectorStats();
      await fetchNotes();
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  // Show loading state only if both are loading and we have no data
  if (loading && !stats && notes.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading vector database...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Database className="h-6 w-6 text-blue-500" />
        <h2 className="text-2xl font-bold">Vector Database Management</h2>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <VectorOverviewTab stats={stats} />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <VectorDocumentsTab notes={notes} onRefresh={handleRefresh} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <VectorAnalyticsTab />
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <VectorToolsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VectorDatabaseDashboard;
