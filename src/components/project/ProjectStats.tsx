
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from '@/components/ui/progress';
import { BarChart } from 'lucide-react';

interface ProjectStatsProps {
  activityPercentage: number;
  imagesCount: number;
  membersCount: number;
  daysActive: number;
}

const ProjectStats = ({
  activityPercentage,
  imagesCount,
  membersCount,
  daysActive,
}: ProjectStatsProps) => {
  return (
    <Card className="md:col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <BarChart className="h-5 w-5 mr-2 text-primary" />
          Project Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Activity</span>
            <span className="font-medium">{activityPercentage}%</span>
          </div>
          <Progress value={activityPercentage} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1 border rounded-md p-3">
            <div className="text-xl font-bold text-primary">{imagesCount}</div>
            <div className="text-xs text-muted-foreground">Images</div>
          </div>
          <div className="space-y-1 border rounded-md p-3">
            <div className="text-xl font-bold text-primary">{membersCount}</div>
            <div className="text-xs text-muted-foreground">Members</div>
          </div>
          <div className="space-y-1 border rounded-md p-3">
            <div className="text-xl font-bold text-primary">{daysActive}</div>
            <div className="text-xs text-muted-foreground">Days active</div>
          </div>
          <div className="space-y-1 border rounded-md p-3">
            <div className="text-xl font-bold text-primary">0</div>
            <div className="text-xs text-muted-foreground">Comments</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectStats;
