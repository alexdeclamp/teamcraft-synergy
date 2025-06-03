
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { 
  Database, 
  Sparkles, 
  Search, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Filter,
  Download,
  Upload,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNoteEmbeddings } from '@/hooks/notes/useNoteEmbeddings';
import { Note } from './types';
import { toast } from 'sonner';

interface VectorStats {
  totalNotes: number;
  embeddedNotes: number;
  embeddingPercentage: number;
  projectBreakdown: Array<{
    projectId: string;
    projectTitle: string;
    totalNotes: number;
    embeddedNotes: number;
    percentage: number;
  }>;
}

interface VectorDatabaseDashboardProps {
  projectId?: string;
}

const VectorDatabaseDashboard: React.FC<VectorDatabaseDashboardProps> = ({ projectId }) => {
  const [stats, setStats] = useState<VectorStats | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'embedded' | 'missing'>('all');
  const [progress, setProgress] = useState(0);
  
  const { batchGenerateEmbeddings, generating } = useNoteEmbeddings();

  useEffect(() => {
    fetchVectorStats();
    fetchNotes();
  }, [projectId]);

  const fetchVectorStats = async () => {
    try {
      let query = supabase
        .from('project_notes')
        .select(`
          id,
          project_id,
          embedding,
          projects!inner(id, title)
        `);

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const totalNotes = data?.length || 0;
      const embeddedNotes = data?.filter(note => 
        note.embedding != null && note.embedding !== ''
      ).length || 0;

      // Group by project
      const projectMap = new Map();
      data?.forEach(note => {
        const projectId = note.project_id;
        const projectTitle = note.projects?.title || 'Unknown Project';
        
        if (!projectMap.has(projectId)) {
          projectMap.set(projectId, {
            projectId,
            projectTitle,
            totalNotes: 0,
            embeddedNotes: 0,
            percentage: 0
          });
        }
        
        const project = projectMap.get(projectId);
        project.totalNotes++;
        
        if (note.embedding != null && note.embedding !== '') {
          project.embeddedNotes++;
        }
        
        project.percentage = project.totalNotes > 0 
          ? Math.round((project.embeddedNotes / project.totalNotes) * 100)
          : 0;
      });

      setStats({
        totalNotes,
        embeddedNotes,
        embeddingPercentage: totalNotes > 0 ? Math.round((embeddedNotes / totalNotes) * 100) : 0,
        projectBreakdown: Array.from(projectMap.values())
      });
    } catch (error) {
      console.error('Error fetching vector stats:', error);
      toast.error('Failed to fetch vector statistics');
    }
  };

  const fetchNotes = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('project_notes')
        .select(`
          id,
          title,
          content,
          embedding,
          created_at,
          updated_at,
          project_id,
          projects!inner(title)
        `)
        .order('updated_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectNote = (noteId: string, checked: boolean) => {
    const newSelected = new Set(selectedNotes);
    if (checked) {
      newSelected.add(noteId);
    } else {
      newSelected.delete(noteId);
    }
    setSelectedNotes(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNotes(new Set(filteredNotes.map(note => note.id)));
    } else {
      setSelectedNotes(new Set());
    }
  };

  const handleBatchEmbedding = async () => {
    if (selectedNotes.size === 0) {
      toast.error('Please select notes to process');
      return;
    }

    setProcessing(true);
    setProgress(0);

    try {
      const selectedNotesData = notes.filter(note => selectedNotes.has(note.id));
      const notesToProcess = selectedNotesData.map(note => ({
        id: note.id,
        title: note.title,
        content: note.content || ''
      }));

      let processed = 0;
      const batchSize = 5;

      for (let i = 0; i < notesToProcess.length; i += batchSize) {
        const batch = notesToProcess.slice(i, i + batchSize);
        await batchGenerateEmbeddings(batch);
        
        processed += batch.length;
        setProgress((processed / notesToProcess.length) * 100);
      }

      await fetchVectorStats();
      await fetchNotes();
      setSelectedNotes(new Set());
      toast.success(`Generated embeddings for ${processed} notes`);
    } catch (error) {
      console.error('Error processing embeddings:', error);
      toast.error('Failed to generate embeddings');
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const handleRegenerateEmbedding = async (noteId: string, title: string, content: string) => {
    try {
      const { batchGenerateEmbeddings } = useNoteEmbeddings();
      await batchGenerateEmbeddings([{ id: noteId, title, content: content || '' }]);
      await fetchVectorStats();
      await fetchNotes();
      toast.success('Embedding regenerated successfully');
    } catch (error) {
      console.error('Error regenerating embedding:', error);
      toast.error('Failed to regenerate embedding');
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchTerm === '' || 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.content || '').toLowerCase().includes(searchTerm.toLowerCase());

    const hasEmbedding = note.embedding != null && note.embedding !== '';
    
    let matchesFilter = true;
    if (filterStatus === 'embedded') {
      matchesFilter = hasEmbedding;
    } else if (filterStatus === 'missing') {
      matchesFilter = !hasEmbedding;
    }

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading && !stats) {
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
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-2 flex-1">
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'embedded' | 'missing')}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Documents</option>
                <option value="embedded">Embedded Only</option>
                <option value="missing">Missing Embeddings</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => handleSelectAll(selectedNotes.size !== filteredNotes.length)}
                variant="outline"
                size="sm"
              >
                {selectedNotes.size === filteredNotes.length ? 'Deselect All' : 'Select All'}
              </Button>
              <Button
                onClick={handleBatchEmbedding}
                disabled={selectedNotes.size === 0 || processing}
                size="sm"
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing... {Math.round(progress)}%
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Embeddings ({selectedNotes.size})
                  </>
                )}
              </Button>
            </div>
          </div>

          {processing && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing embeddings...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Document List */}
          <Card>
            <CardHeader>
              <CardTitle>Documents ({filteredNotes.length})</CardTitle>
              <CardDescription>
                {selectedNotes.size > 0 && `${selectedNotes.size} selected`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredNotes.map((note) => {
                  const hasEmbedding = note.embedding != null && note.embedding !== '';
                  return (
                    <div key={note.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Checkbox
                        checked={selectedNotes.has(note.id)}
                        onCheckedChange={(checked) => handleSelectNote(note.id, checked as boolean)}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium line-clamp-1">{note.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {note.projects?.title || 'Unknown Project'}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {hasEmbedding ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Embedded
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-red-100 text-red-700">
                            <XCircle className="h-3 w-3 mr-1" />
                            Missing
                          </Badge>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRegenerateEmbedding(note.id, note.title, note.content || '')}
                          disabled={processing}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Analytics</CardTitle>
              <CardDescription>Vector search performance insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Search analytics coming soon...</p>
                <p className="text-sm">Track search patterns, result quality, and performance metrics</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Export Embeddings</CardTitle>
                <CardDescription>Download embedding data for backup or analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Export Vector Data
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Import Embeddings</CardTitle>
                <CardDescription>Restore embedding data from backup</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Import Vector Data
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Health Check</CardTitle>
                <CardDescription>Verify embedding integrity and quality</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Run Health Check
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Optimize Database</CardTitle>
                <CardDescription>Clean up and optimize vector storage</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Optimize Vectors
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VectorDatabaseDashboard;
