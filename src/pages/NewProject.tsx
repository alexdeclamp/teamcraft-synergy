
import React, { useState } from 'react';
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
import { ArrowLeft, Info, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const NewProject = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  
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
    
    setLoading(true);
    
    try {
      // Create project in Supabase
      const { data, error } = await supabase
        .from('projects')
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim(),
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
      </main>
    </div>
  );
};

export default NewProject;
