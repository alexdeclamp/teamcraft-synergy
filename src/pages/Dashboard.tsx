
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProjectCard, { ProjectCardProps } from '@/components/ProjectCard';
import Navbar from '@/components/Navbar';
import { Plus, Search, Filter, ArrowUpDown, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'owned' | 'member'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');
  const [projects, setProjects] = useState<ProjectCardProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Fetch projects where user is owner
        const { data: ownedProjects, error: ownedError } = await supabase
          .from('projects')
          .select(`
            id,
            title,
            description,
            created_at,
            updated_at,
            owner_id
          `)
          .eq('owner_id', user.id);

        if (ownedError) throw ownedError;

        // Fetch projects where user is a member
        const { data: memberProjects, error: memberError } = await supabase
          .from('project_members')
          .select(`
            project_id,
            role,
            projects (
              id,
              title,
              description,
              created_at,
              updated_at,
              owner_id
            )
          `)
          .eq('user_id', user.id);

        if (memberError) throw memberError;

        // Process owned projects
        const formattedOwnedProjects = ownedProjects.map(project => ({
          id: project.id,
          title: project.title,
          description: project.description || '',
          createdAt: project.created_at,
          updatedAt: project.updated_at,
          status: 'active' as const,
          memberCount: 1, // We'll update this with actual count later
          isOwner: true
        }));

        // Process member projects (excluding duplicates from owned projects)
        const memberProjectsMap = new Map();
        memberProjects.forEach(item => {
          if (item.projects && item.project_id) {
            const project = item.projects;
            // Skip if user is the owner (already included in ownedProjects)
            if (project.owner_id !== user.id) {
              memberProjectsMap.set(project.id, {
                id: project.id,
                title: project.title,
                description: project.description || '',
                createdAt: project.created_at,
                updatedAt: project.updated_at,
                status: 'active' as const,
                memberCount: 1, // We'll update this later
                isOwner: false,
                role: item.role
              });
            }
          }
        });

        const formattedMemberProjects = Array.from(memberProjectsMap.values());
        
        // Combine projects from both sources
        const allProjects = [...formattedOwnedProjects, ...formattedMemberProjects];
        
        // Fetch member counts for each project
        await Promise.all(allProjects.map(async (project) => {
          const { count, error: countError } = await supabase
            .from('project_members')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id);
            
          if (!countError) {
            // Add 1 for the owner (if not included in the count)
            project.memberCount = (count || 0) + 1;
          }
        }));

        setProjects(allProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        project.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filter === 'all') return matchesSearch;
      if (filter === 'owned') return matchesSearch && project.isOwner;
      if (filter === 'member') return matchesSearch && !project.isOwner;
      
      return matchesSearch;
    })
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
            <h1 className="text-3xl font-bold">Brains</h1>
            <p className="text-muted-foreground mt-1">
              Manage and organize your team's brains
            </p>
          </div>
          
          <Button 
            onClick={() => navigate('/new-project')}
            className="shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Brain
          </Button>
        </div>
        
        {/* Filters and Search */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search brains..."
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
                  {filter === 'all' ? 'All' : 
                   filter === 'owned' ? 'Owned' : 'Member'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by role</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setFilter('all')}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('owned')}>Owned</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('member')}>Member</DropdownMenuItem>
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
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard 
                key={project.id} 
                {...project} 
                className="h-full"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No brains found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || filter !== 'all' ? 'Try adjusting your search or filters' : 'Get started by creating your first brain'}
            </p>
            {!searchTerm && filter === 'all' && (
              <Button 
                onClick={() => navigate('/new-project')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Brain
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
