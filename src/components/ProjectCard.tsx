
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Calendar, 
  MoreHorizontal, 
  Users, 
  ExternalLink,
  Tag,
  Pencil,
  UserPlus,
  Archive
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
import { toast } from 'sonner';

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
}) => {
  const navigate = useNavigate();
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

  const handleEditBrain = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/project/${id}?edit=true`);
  };

  const handleManageMembers = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/project/${id}?tab=members`);
  };

  const handleArchiveBrain = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // This would be implemented in a future update
    toast.info("Archive functionality coming soon");
  };

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
              <DropdownMenuItem onClick={handleEditBrain}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit brain
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleManageMembers}>
                <UserPlus className="h-4 w-4 mr-2" />
                Manage members
              </DropdownMenuItem>
              {isOwner && (
                <DropdownMenuItem onClick={handleArchiveBrain}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive brain
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{createdDate}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
        
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            <div className="flex items-center text-xs text-muted-foreground mr-1">
              <Tag className="h-3 w-3 mr-1" />
            </div>
            {tags.map((tag, index) => (
              <Badge 
                key={`${tag}-${index}`} 
                variant="secondary" 
                className="text-xs px-2 py-0 bg-secondary/40"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
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
