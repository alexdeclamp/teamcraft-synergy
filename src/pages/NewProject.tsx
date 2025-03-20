
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Info, Loader2, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';

const NewProject = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { checkUserLimits, planDetails, upgradeToProPlan } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [limitMessage, setLimitMessage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    aiPersona: '',
  });
  
  // Check limits when component mounts
  useEffect(() => {
    const checkLimits = async () => {
      if (!user) return;
      
      // Perform server-side brain limit check
      const result = await checkUserLimits('brain');
      if (!result.canProceed) {
        console.log('Limit check failed:', result.message);
        setLimitReached(true);
        setLimitMessage(result.message || 'You have reached your plan limit for brains.');
      } else {
        setLimitReached(false);
        setLimitMessage('');
      }
    };
    
    checkLimits();
  }, [user, checkUserLimits]);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Please enter a brain title");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to create a brain");
      return;
    }
    
    // Check if user is at their brain limit before creating
    setLoading(true);
    
    // Double-check with the server to ensure user hasn't created brains in another tab/session
    const limitCheck = await checkUserLimits('brain');
    
    if (!limitCheck.canProceed) {
      setLimitReached(true);
      setLimitMessage(limitCheck.message || "You've reached your plan limits. Please upgrade to create more brains.");
      toast.error(limitCheck.message || "You've reached your plan limits");
      setLoading(false);
      return;
    }
    
    try {
      // Create project in Supabase
      const { data, error } = await supabase
        .from('projects')
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim(),
          ai_persona: formData.aiPersona.trim(),
          owner_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success("Brain created successfully!");
      navigate(`/project/${data.id}`);
    } catch (error: any) {
      console.error("Error creating brain:", error);
      toast.error(error.message || "Failed to create brain. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-12 animate-fade-in">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="mb-6"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Brains
          </Button>
          
          <h1 className="text-3xl font-bold">Create a New Brain</h1>
          <p className="text-muted-foreground mt-1">
            Set up your brain and start collaborating with your team
          </p>
        </div>
        
        {limitReached ? (
          <Card className="shadow-sm border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-800 flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Plan Limit Reached
              </CardTitle>
              <CardDescription className="text-amber-700">
                {limitMessage}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-amber-800 mb-4">
                Upgrade to our Pro plan to create unlimited brains and access more features.
              </p>
              <Button 
                className="w-full" 
                onClick={() => upgradeToProPlan()}
              >
                Upgrade to Pro
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-sm">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Brain Details</CardTitle>
                <CardDescription>
                  Enter the basic information about your brain
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Brain Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter brain title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter brain description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="aiPersona" className="text-sm font-medium">
                    AI Persona
                  </label>
                  <Textarea
                    id="aiPersona"
                    name="aiPersona"
                    placeholder="Describe how you want the AI assistant to behave"
                    rows={4}
                    value={formData.aiPersona}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    This will guide how the AI assistant responds when discussing your project
                  </p>
                </div>
                
                <div className="rounded-md bg-blue-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Info className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-800">
                        After creating your brain, you'll be able to add team members and set up permissions.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Brain
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </main>
    </div>
  );
};

export default NewProject;
