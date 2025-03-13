
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InvitationBanner } from '@/components/ui/invitation-banner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface WaitlistLayoutProps {
  children: React.ReactNode;
}

export const WaitlistLayout: React.FC<WaitlistLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <InvitationBanner />
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Button>
          
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Join our Waitlist</CardTitle>
              <CardDescription>
                Request access to our private beta. We'll notify you when your spot is ready.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {children}
            </CardContent>
            
            <CardFooter className="text-xs text-muted-foreground">
              We respect your privacy and will never share your information with third parties.
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};
