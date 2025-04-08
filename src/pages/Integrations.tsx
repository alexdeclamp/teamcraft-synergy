
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/landing/FooterSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ExternalLink, Import, Link2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import useNotionConnection from '@/hooks/useNotionConnection';

const Integrations = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isConnected } = useNotionConnection();

  const integrations = [
    {
      id: 'notion',
      name: 'Notion',
      description: 'Import content from Notion pages and databases',
      icon: <svg viewBox="0 0 120 126" className="h-12 w-12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.6927 21.9329C24.5502 25.0587 26.3079 24.8232 33.7051 24.5283L101.37 21.9329C102.889 21.9329 101.861 20.6568 101.37 20.4213L89.0037 12.9699C87.7249 12.0249 85.941 11.08 82.3206 11.3748L18.1949 14.7164C16.19 14.9519 15.6988 16.4636 16.676 17.6457L20.6927 21.9329Z" fill="black"/>
              <path d="M24.5509 40.1282V114.963C24.5509 118.324 26.555 119.505 30.8088 119.269L105.388 115.67C109.642 115.435 110.623 112.781 110.623 110.127V35.528C110.623 32.873 109.15 31.4565 106.604 31.692L28.5681 35.0558C25.7838 35.2912 24.5509 36.7077 24.5509 40.1282ZM93.0207 45.3521C93.5128 47.2355 92.7769 49.1188 90.9229 49.3542L87.2269 49.8329V104.321C84.1978 105.738 81.1688 106.447 78.6253 106.447C74.3715 106.447 73.1965 105.267 70.6531 102.142L43.6339 61.3277V101.434L51.2771 103.087C51.2771 103.087 51.2771 106.447 46.2904 106.447L29.9763 107.157C29.4842 106.212 29.7304 104.557 31.0991 104.085L36.0021 102.614V54.6121L28.8141 54.1399C28.322 52.2511 29.5429 49.8913 32.5241 49.6559L49.5671 48.9513L77.1602 90.2399V54.6121L69.6704 53.9058C69.1783 51.5513 70.8828 49.656 73.1965 49.4206L93.0207 45.3521Z" fill="black"/>
            </svg>,
      isConnected: isConnected,
      connectPath: '/notion-connect',
      importPath: '/notion-import'
    }
    // More integrations will be added here in the future
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container max-w-6xl mx-auto py-12 px-4 pt-32">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Integrations</h1>
        <p className="text-muted-foreground mb-8">
          Connect your workspace with external services to import and sync content
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {integrations.map((integration) => (
            <Card key={integration.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-muted rounded-md">
                    {integration.icon}
                  </div>
                  {integration.isConnected && (
                    <div className="flex items-center text-green-600 text-sm font-medium">
                      <Check className="mr-1 h-4 w-4" />
                      Connected
                    </div>
                  )}
                </div>
                <CardTitle className="mt-4">{integration.name}</CardTitle>
                <CardDescription>{integration.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />
                    <span>Import content directly to your projects</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />
                    <span>Keep your content in sync across platforms</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="pt-3">
                {integration.isConnected ? (
                  <div className="flex gap-3 w-full">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => navigate(integration.connectPath)}
                    >
                      <Link2 className="mr-2 h-4 w-4" />
                      Manage
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={() => navigate(integration.importPath)}
                    >
                      <Import className="mr-2 h-4 w-4" />
                      Import
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={() => navigate(integration.connectPath)} 
                    className="w-full"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Connect
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
      
      <FooterSection />
    </div>
  );
};

export default Integrations;
