
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/landing/FooterSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Check, ExternalLink, Loader2 } from 'lucide-react';
import useGoogleDriveConnection from '@/hooks/useGoogleDriveConnection';

const GoogleDriveConnect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected, userInfo, checkGoogleDriveConnection } = useGoogleDriveConnection();
  
  // Check for OAuth code in URL (after Google redirects back)
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  
  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      if (!code || !user) return;
      
      setIsLoading(true);
      try {
        // Get the current redirect URI to pass to the backend
        // Use the exact same format that's configured in Google Cloud Console
        const redirectUri = `${window.location.origin}/google-drive-connect`;
        
        // Exchange the code for access token, passing the actual redirect URI used
        const { data, error } = await supabase.functions.invoke('google-drive-exchange-token', {
          body: { 
            code, 
            userId: user.id,
            redirectUri
          }
        });
        
        if (error) throw error;
        
        toast.success("Successfully connected to Google Drive!");
        await checkGoogleDriveConnection();
        
        // Remove code from URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (err) {
        console.error("Error connecting to Google Drive:", err);
        toast.error(`Failed to connect: ${err.message || 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (error) {
      toast.error(`Google Drive connection error: ${error}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      handleOAuthCallback();
    }
  }, [code, error, user, checkGoogleDriveConnection]);
  
  const connectToGoogleDrive = () => {
    // Google OAuth URL with your client ID and fixed redirect URI
    const clientId = '312467123740-kapmie1lpqg4h5chlg3lh4pcs6iosfaa.apps.googleusercontent.com';
    // Use the exact same format that's configured in Google Cloud Console
    const redirectUri = encodeURIComponent(`${window.location.origin}/google-drive-connect`);
    const scope = encodeURIComponent('https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly');
    
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
    
    window.location.href = googleAuthUrl;
  };
  
  const disconnectGoogleDrive = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('google-drive-disconnect', {
        body: { userId: user.id }
      });
      
      if (error) throw error;
      
      toast.success("Disconnected from Google Drive");
      await checkGoogleDriveConnection();
    } catch (err) {
      console.error("Error disconnecting from Google Drive:", err);
      toast.error(`Failed to disconnect: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

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
          
          <h1 className="text-3xl font-bold tracking-tight">Google Drive Integration</h1>
          <p className="text-muted-foreground mt-2">
            Connect your Google Drive account to import documents and files
          </p>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Connect with Google Drive</CardTitle>
            <CardDescription>
              Link your Google Drive account to import documents and files into your projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Connecting with Google Drive allows you to:
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />
                <span>Import documents as project notes</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />
                <span>Access your files directly from the application</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />
                <span>Keep your content in sync across platforms</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {isConnected ? (
              <div className="space-y-4 w-full">
                <div className="flex items-center text-green-600 mb-2">
                  <Check className="mr-2 h-5 w-5" />
                  <span>
                    Connected to Google Drive
                    {userInfo?.name && userInfo?.email && (
                      <span className="text-sm text-muted-foreground ml-2">
                        ({userInfo.name} - {userInfo.email})
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex space-x-4">
                  <Button 
                    onClick={() => navigate('/google-drive-import')} 
                    className="flex items-center"
                  >
                    Import Files
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={disconnectGoogleDrive}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Disconnect
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                onClick={connectToGoogleDrive} 
                disabled={isLoading}
                className="flex items-center"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Connect to Google Drive
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
        
        <div className="text-sm text-muted-foreground">
          <p>
            Note: This integration requires permission to access your Google Drive. 
            You can revoke access at any time from your Google Account settings.
          </p>
        </div>
      </main>
      
      <FooterSection />
    </div>
  );
};

export default GoogleDriveConnect;
