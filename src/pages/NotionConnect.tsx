
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

const NotionConnect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  // Check for OAuth code in URL (after Notion redirects back)
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  
  // Fetch connection status on load
  useEffect(() => {
    const checkConnectionStatus = async () => {
      if (!user) return;
      
      try {
        // Use query builder with explicit 'from' method to avoid type errors
        const { data, error } = await supabase
          .from('notion_connections' as any)
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (data && !error) {
          setIsConnected(true);
        }
      } catch (err) {
        console.error("Error checking Notion connection:", err);
      }
    };
    
    checkConnectionStatus();
  }, [user]);
  
  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      if (!code || !user) return;
      
      setIsLoading(true);
      try {
        // Exchange the code for access token
        const { data, error } = await supabase.functions.invoke('notion-exchange-token', {
          body: { code, userId: user.id }
        });
        
        if (error) throw error;
        
        toast.success("Successfully connected to Notion!");
        setIsConnected(true);
        
        // Remove code from URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (err: any) {
        console.error("Error connecting to Notion:", err);
        toast.error(`Failed to connect: ${err.message || 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (error) {
      toast.error(`Notion connection error: ${error}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      handleOAuthCallback();
    }
  }, [code, error, user]);
  
  const connectToNotion = () => {
    // Notion OAuth URL with your client ID
    const clientId = '1ced872b-594c-8011-973d-0037bb560676';
    const redirectUri = encodeURIComponent(window.location.origin + '/notion-connect');
    const notionAuthUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
    
    window.location.href = notionAuthUrl;
  };
  
  const disconnectNotion = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('notion-disconnect', {
        body: { userId: user.id }
      });
      
      if (error) throw error;
      
      toast.success("Disconnected from Notion");
      setIsConnected(false);
    } catch (err: any) {
      console.error("Error disconnecting from Notion:", err);
      toast.error(`Failed to disconnect: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container max-w-4xl mx-auto py-12 px-4">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/integrations')}
            className="flex items-center text-muted-foreground mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Integrations
          </Button>
          
          <h1 className="text-3xl font-bold tracking-tight">Notion Integration</h1>
          <p className="text-muted-foreground mt-2">
            Connect your Notion account to import pages and databases
          </p>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Connect with Notion</CardTitle>
            <CardDescription>
              Link your Notion account to import pages and databases into your projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Connecting with Notion allows you to:
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />
                <span>Import Notion pages as project notes</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />
                <span>Sync databases between Notion and your projects</span>
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
                  <span>Connected to Notion</span>
                </div>
                <div className="flex space-x-4">
                  <Button 
                    onClick={() => navigate('/notion-import')} 
                    className="flex items-center"
                  >
                    Import Content
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={disconnectNotion}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Disconnect
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                onClick={connectToNotion} 
                disabled={isLoading}
                className="flex items-center"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Connect to Notion
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
        
        <div className="text-sm text-muted-foreground">
          <p>
            Note: This integration requires permission to access your Notion workspace. 
            You can revoke access at any time from your Notion settings.
          </p>
        </div>
      </main>
      
      <FooterSection />
    </div>
  );
};

export default NotionConnect;
