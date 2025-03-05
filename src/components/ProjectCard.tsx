
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Calendar, 
  MoreHorizontal, 
  Users, 
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';

export interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'archived' | 'completed';
  memberCount: number;
  className?: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  title,
  description,
  createdAt,
  updatedAt,
  status,
  memberCount,
  className,
}) => {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800',
    completed: 'bg-blue-100 text-blue-800',
  };

  const createdDate = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 bg-white border hover:shadow-md animate-scale-in",
      className
    )}>
      <CardHeader className="relative pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <Badge variant="outline" className={cn(
              "mb-2 font-normal",
              statusColors[status]
            )}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
            <CardTitle className="text-xl font-semibold">{title}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>Edit project</DropdownMenuItem>
              <DropdownMenuItem>Manage members</DropdownMenuItem>
              <DropdownMenuItem>Archive project</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{createdDate}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Link to={`/project/${id}`} className="w-full">
          <Button 
            variant="ghost" 
            className="w-full justify-between hover:bg-accent/50"
          >
            <span>View project</span>
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
