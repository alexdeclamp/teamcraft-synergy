
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Database, Sparkles, TrendingUp } from 'lucide-react';
import { VectorStats } from './types';

interface VectorOverviewTabProps {
  stats: VectorStats | null;
}

const VectorOverviewTab: React.FC<VectorOverviewTabProps> = ({ stats }) => {
  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-4">
      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalNotes || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Embedded Documents</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.embeddedNotes || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.embeddingPercentage || 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Embedding Coverage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.embeddingPercentage || 0}%</div>
            <Progress value={stats?.embeddingPercentage || 0} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Project Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Project Breakdown</CardTitle>
          <CardDescription>Embedding status by project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.projectBreakdown.map((project) => (
              <div key={project.projectId} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium">{project.projectTitle}</div>
                  <div className="text-sm text-muted-foreground">
                    {project.embeddedNotes} of {project.totalNotes} documents
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getStatusColor(project.percentage)}>
                    {project.percentage}%
                  </Badge>
                  <Progress value={project.percentage} className="w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VectorOverviewTab;
