
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import useGoogleDriveConnection from '@/hooks/useGoogleDriveConnection';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/landing/FooterSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, ArrowRight, File, FileText, FolderOpen, 
  Loader2, RefreshCw, Search, X
} from 'lucide-react';

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  thumbnailLink?: string;
  size?: string;
  modifiedTime: string;
}

const GoogleDriveImport = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isConnected, isCheckingConnection } = useGoogleDriveConnection();
  
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folderStack, setFolderStack] = useState<{ id: string | null; name: string }[]>([{ id: null, name: 'My Drive' }]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFiles, setFilteredFiles] = useState<GoogleDriveFile[]>([]);
  
  // Load files when component mounts or folder changes
  useEffect(() => {
    if (isConnected && user) {
      fetchFiles(currentFolder);
    }
  }, [isConnected, user, currentFolder]);
  
  // Filter files based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredFiles(files);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredFiles(files.filter(file => 
        file.name.toLowerCase().includes(query)
      ));
    }
  }, [files, searchQuery]);
  
  const fetchFiles = async (folderId: string | null) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-drive-import', {
        body: { 
          userId: user.id,
          folderId 
        }
      });
      
      if (error) throw error;
      
      setFiles(data.files || []);
    } catch (err) {
      console.error("Error fetching Google Drive files:", err);
      toast.error(`Failed to fetch files: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const navigateToFolder = (folderId: string, folderName: string) => {
    setCurrentFolder(folderId);
    setFolderStack([...folderStack, { id: folderId, name: folderName }]);
  };
  
  const navigateUp = () => {
    if (folderStack.length > 1) {
      const newStack = [...folderStack];
      newStack.pop();
      setFolderStack(newStack);
      setCurrentFolder(newStack[newStack.length - 1].id);
    }
  };
  
  const navigateToRoot = () => {
    setFolderStack([{ id: null, name: 'My Drive' }]);
    setCurrentFolder(null);
  };
  
  const refreshFiles = () => {
    fetchFiles(currentFolder);
  };
  
  const getMimeTypeIcon = (mimeType: string) => {
    if (mimeType === 'application/vnd.google-apps.folder') {
      return <FolderOpen className="h-6 w-6 text-blue-500" />;
    } else if (mimeType.includes('pdf')) {
      return <FileText className="h-6 w-6 text-red-500" />;
    } else if (mimeType.includes('document')) {
      return <FileText className="h-6 w-6 text-blue-600" />;
    } else if (mimeType.includes('spreadsheet')) {
      return <FileText className="h-6 w-6 text-green-600" />;
    } else if (mimeType.includes('presentation')) {
      return <FileText className="h-6 w-6 text-amber-600" />;
    } else {
      return <File className="h-6 w-6 text-gray-500" />;
    }
  };
  
  const formatFileSize = (size?: string) => {
    if (!size) return 'N/A';
    
    const sizeInBytes = parseInt(size, 10);
    if (isNaN(sizeInBytes)) return 'N/A';
    
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    } else if (sizeInBytes < 1024 * 1024 * 1024) {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  
  if (isCheckingConnection) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 container max-w-4xl mx-auto py-12 px-4 pt-32 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
            <p>Checking Google Drive connection...</p>
          </div>
        </main>
      </div>
    );
  }
  
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 container max-w-4xl mx-auto py-12 px-4 pt-32">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/integrations')}
              className="flex items-center text-muted-foreground mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Integrations
            </Button>
            
            <h1 className="text-3xl font-bold tracking-tight">Google Drive Import</h1>
            <p className="text-muted-foreground mt-2">
              Connect to Google Drive to access your files
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Connection Required</CardTitle>
              <CardDescription>
                You need to connect to Google Drive before you can import files
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={() => navigate('/google-drive-connect')}>
                Connect to Google Drive
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </main>
        <FooterSection />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container max-w-6xl mx-auto py-12 px-4 pt-32">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/integrations')}
              className="flex items-center text-muted-foreground mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Integrations
            </Button>
            
            <h1 className="text-3xl font-bold tracking-tight">Google Drive Files</h1>
            <p className="text-muted-foreground mt-2">
              Browse and import files from your Google Drive
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <Button 
              variant="outline" 
              onClick={refreshFiles}
              disabled={isLoading}
              className="flex items-center"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </div>
        
        <Card className="mb-8">
          <CardHeader className="pb-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="breadcrumbs flex items-center flex-wrap mb-4 sm:mb-0">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={navigateToRoot}
                  className="text-sm font-medium"
                >
                  My Drive
                </Button>
                
                {folderStack.slice(1).map((folder, index) => (
                  <React.Fragment key={folder.id || 'root'}>
                    <span className="mx-1 text-muted-foreground">/</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        // Navigate to the selected folder in the breadcrumb
                        const newStack = folderStack.slice(0, index + 2);
                        setFolderStack(newStack);
                        setCurrentFolder(newStack[newStack.length - 1].id);
                      }}
                      className="text-sm font-medium truncate max-w-[180px]"
                    >
                      {folder.name}
                    </Button>
                  </React.Fragment>
                ))}
              </div>
              
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search files..."
                  className="pl-9 pr-9 w-full"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                {searchQuery ? 'No files match your search query' : 'No files found in this folder'}
              </div>
            ) : (
              <div className="border rounded-md">
                <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 p-3 border-b bg-muted/50 font-medium text-sm">
                  <div className="w-10"></div>
                  <div>Name</div>
                  <div className="w-32 text-right">Size</div>
                  <div className="w-32 text-right">Modified</div>
                </div>
                
                {folderStack.length > 1 && !searchQuery && (
                  <div 
                    className="grid grid-cols-[auto_1fr_auto_auto] gap-4 p-3 border-b hover:bg-muted/50 cursor-pointer"
                    onClick={navigateUp}
                  >
                    <div className="flex justify-center">
                      <FolderOpen className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="flex items-center truncate">
                      <span className="font-medium">...</span>
                    </div>
                    <div className="text-right"></div>
                    <div className="text-right"></div>
                  </div>
                )}
                
                {filteredFiles.map((file) => (
                  <div 
                    key={file.id}
                    className="grid grid-cols-[auto_1fr_auto_auto] gap-4 p-3 border-b hover:bg-muted/50 cursor-pointer"
                    onClick={() => {
                      if (file.mimeType === 'application/vnd.google-apps.folder') {
                        navigateToFolder(file.id, file.name);
                      } else {
                        window.open(file.webViewLink, '_blank');
                      }
                    }}
                  >
                    <div className="flex justify-center">
                      {getMimeTypeIcon(file.mimeType)}
                    </div>
                    <div className="flex items-center truncate">
                      <span className="truncate">{file.name}</span>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {file.mimeType === 'application/vnd.google-apps.folder' 
                        ? '—' 
                        : formatFileSize(file.size)}
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {formatDate(file.modifiedTime)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      <FooterSection />
    </div>
  );
};

export default GoogleDriveImport;
