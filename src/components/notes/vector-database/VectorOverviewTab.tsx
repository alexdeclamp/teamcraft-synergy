
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { VectorStats } from './types';

interface VectorOverviewTabProps {
  stats: VectorStats | null;
}

const VectorOverviewTab: React.FC<VectorOverviewTabProps> = ({ stats }) => {
  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No vector data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Notes</CardTitle>
          <CardDescription>All notes in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.totalNotes}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Embedded Notes</CardTitle>
          <CardDescription>Notes with vector embeddings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">{stats.embeddedNotes}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Embedding Coverage</CardTitle>
          <CardDescription>Percentage of notes with embeddings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold">{stats.embeddingPercentage}%</div>
            <Progress value={stats.embeddingPercentage} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {stats.projectBreakdown.length > 0 && (
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Project Breakdown</CardTitle>
            <CardDescription>Embedding status by project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.projectBreakdown.map((project) => (
                <div key={project.projectId} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{project.projectTitle}</span>
                    <span className="text-sm text-muted-foreground">
                      {project.embeddedNotes}/{project.totalNotes} ({project.percentage}%)
                    </span>
                  </div>
                  <Progress value={project.percentage} className="w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VectorOverviewTab;
