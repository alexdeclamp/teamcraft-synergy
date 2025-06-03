
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Sparkles, Loader2, AlertCircle, Lightbulb, Bug } from 'lucide-react';
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
  const [hasSearched, setHasSearched] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const { searchNotes } = useVectorSearch();

  const searchSuggestions = [
    "project planning strategies",
    "user experience research",
    "A/B testing methodologies", 
    "design system components",
    "performance optimization",
    "data analysis techniques"
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    console.log('🔍 Starting semantic search:', { searchQuery, projectId });
    setIsSearching(true);
    setHasSearched(true);
    setErrorMessage('');
    setDebugInfo(null);
    
    try {
      console.log('📡 Calling searchNotes function...');
      const startTime = Date.now();
      
      const results = await searchNotes(searchQuery, projectId, 'semantic');
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log('✅ Search completed:', { 
        results, 
        resultCount: results?.length || 0, 
        duration: `${duration}ms` 
      });
      
      setLocalResults(results || []);
      setDebugInfo({
        query: searchQuery,
        projectId,
        resultCount: results?.length || 0,
        duration,
        timestamp: new Date().toISOString()
      });
      
      if (!results || results.length === 0) {
        console.log('⚠️ No results returned from search');
      }
    } catch (error) {
      console.error('❌ Search error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown search error');
      setDebugInfo({
        query: searchQuery,
        projectId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleTestSearch = async () => {
    console.log('🧪 Running test search...');
    setSearchQuery('test search functionality');
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
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

  const getScoreColor = (similarity: number) => {
    if (similarity >= 0.8) return 'bg-green-100 text-green-800';
    if (similarity >= 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getScoreLabel = (similarity: number) => {
    if (similarity >= 0.8) return 'High match';
    if (similarity >= 0.7) return 'Good match';
    return 'Weak match';
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
          <Button 
            onClick={handleTestSearch} 
            disabled={isSearching}
            variant="outline"
            size="sm"
          >
            <Bug className="h-4 w-4" />
          </Button>
        </div>

        {isSearching && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Searching...</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Search Error</p>
                <p className="text-sm">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {debugInfo && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
            <p className="font-medium text-blue-800">Debug Info:</p>
            <pre className="text-blue-700 whitespace-pre-wrap">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        {hasSearched && !isSearching && !errorMessage && localResults.length === 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground p-4 bg-muted/30 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">No matching notes found</p>
                <p className="text-sm">Try rephrasing your search or using different keywords.</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Lightbulb className="h-4 w-4" />
                <span>Try searching for:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

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
                    <div className="flex flex-col items-end gap-1 ml-2">
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(result.similarity * 100)}% match
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getScoreColor(result.similarity)}`}
                      >
                        {getScoreLabel(result.similarity)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SemanticSearch;
