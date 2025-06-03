
import React, { useState, useEffect } from 'react';
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
  const [allResults, setAllResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [threshold, setThreshold] = useState(0.3);
  
  const { searchNotes } = useVectorSearch();

  // Auto-filter results when threshold changes
  useEffect(() => {
    if (allResults.length > 0) {
      const filteredResults = allResults.filter(result => result.similarity >= threshold);
      setLocalResults(filteredResults);
      
      // Update debug info with new filter
      setDebugInfo(prev => prev ? {
        ...prev,
        threshold,
        resultCount: filteredResults.length,
        totalResults: allResults.length
      } : null);
    }
  }, [threshold, allResults]);

  const searchSuggestions = [
    "project planning strategies",
    "user experience research",
    "A/B testing methodologies", 
    "design system components",
    "performance optimization",
    "data analysis techniques"
  ];

  const getThresholdLabel = (value: number) => {
    if (value >= 0.7) return { label: 'Very strict', color: 'bg-red-100 text-red-800' };
    if (value >= 0.5) return { label: 'Strict', color: 'bg-orange-100 text-orange-800' };
    if (value >= 0.3) return { label: 'Balanced', color: 'bg-blue-100 text-blue-800' };
    if (value >= 0.2) return { label: 'Relaxed', color: 'bg-green-100 text-green-800' };
    return { label: 'Very relaxed', color: 'bg-gray-100 text-gray-800' };
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    console.log('🔍 Starting semantic search:', { searchQuery, projectId, threshold });
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
        duration: `${duration}ms`,
        threshold
      });
      
      // Store all results and filter by threshold
      const allSearchResults = results || [];
      setAllResults(allSearchResults);
      const filteredResults = allSearchResults.filter(result => result.similarity >= threshold);
      setLocalResults(filteredResults);
      
      setDebugInfo({
        query: searchQuery,
        projectId,
        resultCount: filteredResults.length,
        totalResults: allSearchResults.length,
        duration,
        threshold,
        timestamp: new Date().toISOString()
      });
      
      if (filteredResults.length === 0) {
        console.log('⚠️ No results above threshold:', threshold);
      }
    } catch (error) {
      console.error('❌ Search error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown search error');
      setDebugInfo({
        query: searchQuery,
        projectId,
        threshold,
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
    setThreshold(0.1); // Use very low threshold for testing
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

  const handleQuickThreshold = (newThreshold: number) => {
    setThreshold(newThreshold);
    // No need to trigger search here - useEffect will handle filtering
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

  const thresholdInfo = getThresholdLabel(threshold);

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

        {/* Threshold Controls - Always Visible */}
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Threshold:</span>
            <Badge variant="outline" className={`${thresholdInfo.color} font-mono`}>
              {threshold.toFixed(2)}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {thresholdInfo.label}
            </Badge>
          </div>
          
          {hasSearched && (
            <Badge variant="outline" className="text-xs">
              {localResults.length} results
            </Badge>
          )}

          <div className="flex gap-1 ml-auto">
            <Button
              variant={threshold === 0.1 ? "default" : "outline"}
              size="sm"
              className="text-xs px-2 py-1 h-7"
              onClick={() => handleQuickThreshold(0.1)}
            >
              0.1
            </Button>
            <Button
              variant={threshold === 0.3 ? "default" : "outline"}
              size="sm"
              className="text-xs px-2 py-1 h-7"
              onClick={() => handleQuickThreshold(0.3)}
            >
              0.3
            </Button>
            <Button
              variant={threshold === 0.5 ? "default" : "outline"}
              size="sm"
              className="text-xs px-2 py-1 h-7"
              onClick={() => handleQuickThreshold(0.5)}
            >
              0.5
            </Button>
            <Button
              variant={threshold === 0.7 ? "default" : "outline"}
              size="sm"
              className="text-xs px-2 py-1 h-7"
              onClick={() => handleQuickThreshold(0.7)}
            >
              0.7
            </Button>
          </div>
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
                <p className="font-medium">No matching notes found above threshold {threshold.toFixed(2)}</p>
                <p className="text-sm">Try lowering the threshold or rephrasing your search.</p>
                {allResults.length > 0 && (
                  <p className="text-sm">Found {allResults.length} total results, but none above your threshold.</p>
                )}
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
              {allResults.length !== localResults.length && (
                <span> (filtered from {allResults.length} total results)</span>
              )}
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
