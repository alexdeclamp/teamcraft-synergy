
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProjectCard, { ProjectCardProps } from '@/components/ProjectCard';
import Navbar from '@/components/Navbar';
import { Plus, Search, Filter, ArrowUpDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'archived' | 'completed'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');

  // Mock projects data - this would come from Supabase in a real app
  const mockProjects: ProjectCardProps[] = [
    {
      id: '1',
      title: 'Website Redesign',
      description: 'Complete overhaul of the company website with new design system',
      createdAt: '2023-09-15T12:00:00Z',
      updatedAt: '2023-09-20T10:30:00Z',
      status: 'active',
      memberCount: 5,
    },
    {
      id: '2',
      title: 'Mobile App Development',
      description: 'Building a native mobile application for both iOS and Android platforms',
      createdAt: '2023-08-10T09:00:00Z',
      updatedAt: '2023-09-18T14:45:00Z',
      status: 'active',
      memberCount: 8,
    },
    {
      id: '3',
      title: 'Marketing Campaign',
      description: 'Q4 marketing campaign focusing on product launch',
      createdAt: '2023-07-20T15:30:00Z',
      updatedAt: '2023-09-05T11:15:00Z',
      status: 'completed',
      memberCount: 4,
    },
    {
      id: '4',
      title: 'Legacy System Migration',
      description: 'Migrating data and functionality from legacy systems to new platform',
      createdAt: '2023-06-05T08:15:00Z',
      updatedAt: '2023-08-30T16:20:00Z',
      status: 'archived',
      memberCount: 6,
    },
  ];

  // Filter and sort projects
  const filteredProjects = mockProjects
    .filter(project => 
      (filter === 'all' || project.status === filter) &&
      (project.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
       project.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortOrder === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });

  return (
    <div className="min-h-screen bg-background pb-12 animate-fade-in">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-muted-foreground mt-1">
              Manage and organize your team's projects
            </p>
          </div>
          
          <Button 
            onClick={() => navigate('/new-project')}
            className="shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
        
        {/* Filters and Search */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-[130px]">
                  <Filter className="h-4 w-4 mr-2" />
                  {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setFilter('all')}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('active')}>Active</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('completed')}>Completed</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('archived')}>Archived</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-[140px]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  {sortOrder === 'newest' ? 'Newest' : 
                   sortOrder === 'oldest' ? 'Oldest' : 'A-Z'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setSortOrder('newest')}>Newest</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder('oldest')}>Oldest</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder('alphabetical')}>Alphabetical</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Project Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <ProjectCard 
                key={project.id} 
                {...project} 
                className="h-full"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm ? 'Try adjusting your search or filters' : 'Get started by creating your first project'}
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => navigate('/new-project')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
