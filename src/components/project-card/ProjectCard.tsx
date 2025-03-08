
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ProjectCardBadge from './ProjectCardBadge';
import ProjectCardActions from './ProjectCardActions';
import ProjectCardMetadata from './ProjectCardMetadata';

export interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'archived' | 'completed';
  memberCount: number;
  isOwner?: boolean;
  tags?: string[];
  className?: string;
  isFavorite?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  title,
  description,
  createdAt,
  updatedAt,
  status,
  memberCount,
  isOwner,
  tags = [],
  className,
  isFavorite = false,
}) => {
  const [favorite, setFavorite] = useState(isFavorite);

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 bg-white border hover:shadow-md animate-scale-in",
      className
    )}>
      <CardHeader className="relative pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <ProjectCardBadge status={status} />
            <CardTitle className="text-xl font-semibold">{title}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </CardDescription>
          </div>
          <ProjectCardActions 
            id={id} 
            isOwner={isOwner} 
            isFavorite={favorite}
            setFavorite={setFavorite}
          />
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <ProjectCardMetadata 
          createdAt={createdAt}
          memberCount={memberCount}
          tags={tags}
        />
      </CardContent>
      
      <CardFooter className="pt-0">
        <Link to={`/project/${id}`} className="w-full">
          <Button 
            variant="ghost" 
            className="w-full justify-between hover:bg-accent/50"
          >
            <span>View brain</span>
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
