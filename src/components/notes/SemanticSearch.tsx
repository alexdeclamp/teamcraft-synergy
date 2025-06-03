
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Sparkles, Loader2 } from 'lucide-react';
import { useVectorSearch } from '@/hooks/notes/useVectorSearch';
import { Note } from './types';

interface SemanticSearchProps {
  projectId: string;
  onNoteSelect: (note: Note) => void;
}

const SemanticSearch: React.FC<SemanticSearchProps> = ({ projectId, onNoteSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [localResults, setLocalResults] = useState<any[]>([]);
  
  const { searchNotes } = useVectorSearch();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchNotes(searchQuery, projectId, 'semantic');
      setLocalResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const convertToNote = (result: any): Note => {
    return {
      id: result.id,
      title: result.title,
      content: result.content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: '',
      project_id: projectId,
    };
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <CardTitle>Semantic Search</CardTitle>
        </div>
        <CardDescription>
          Find notes by meaning, not just keywords. Ask questions or describe what you're looking for.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="e.g., 'notes about project planning' or 'ideas for improving user experience'"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button 
            onClick={handleSearch} 
            disabled={isSearching || !searchQuery.trim()}
            className="px-6"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {localResults.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <div className="text-sm text-muted-foreground">
              Found {localResults.length} semantically similar notes
            </div>
            {localResults.map((result) => (
              <Card 
                key={result.id} 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onNoteSelect(convertToNote(result))}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium line-clamp-1">{result.title}</h4>
                      {result.content && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {result.content}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {Math.round(result.similarity * 100)}% match
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {isSearching && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Searching...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SemanticSearch;
