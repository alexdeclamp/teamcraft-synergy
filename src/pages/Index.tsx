
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  // This will redirect users to the dashboard if they're already authenticated
  // This is a placeholder - you'll need to integrate Supabase auth
  useEffect(() => {
    // Check if user is authenticated (placeholder)
    const isAuthenticated = false;
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 pt-16 pb-24 animate-fade-in">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row items-center">
            {/* Text Content */}
            <div className="flex-1 text-center md:text-left md:pr-12 max-w-2xl mx-auto md:mx-0">
              <div className="mb-6 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                <span className="animate-pulse mr-2">●</span> Introducing ProjectSync
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Collaborate and
                <span className="text-primary"> streamline</span> your projects
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 md:mb-10">
                A beautiful workspace where teams build projects together. Create, collaborate and deliver—all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button 
                  size="lg"
                  className="text-md px-8 py-6 rounded-lg transition-all"
                  onClick={() => navigate('/dashboard')}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="text-md px-8 py-6 rounded-lg"
                >
                  Learn More
                </Button>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="flex-1 mt-12 md:mt-0 max-w-md md:max-w-none mx-auto">
              <div className="glass-card p-1 md:p-2 rounded-2xl shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80" 
                  alt="Project Dashboard Preview" 
                  className="rounded-xl object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-secondary py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful features for teams</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage projects and collaborate with your team, all in one place.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                title: 'Project Management', 
                description: 'Create and manage projects with intuitive tools designed for efficiency.',
                icon: '💼'
              },
              { 
                title: 'Team Collaboration', 
                description: 'Invite team members and assign different permission levels.',
                icon: '👥'
              },
              { 
                title: 'Detailed Analytics', 
                description: 'Track progress with real-time analytics and reporting tools.',
                icon: '📊'
              },
            ].map((feature, i) => (
              <div 
                key={i} 
                className="glass-card p-6 flex flex-col items-center text-center animate-slide-in"
                style={{animationDelay: `${i * 100}ms`}}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why choose ProjectSync?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We've designed ProjectSync to be the most intuitive and efficient project management platform.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              'Beautiful, intuitive interface',
              'Powerful collaboration tools',
              'Role-based permissions',
              'Real-time updates',
              'Secure data storage',
              'Integration capabilities'
            ].map((benefit, i) => (
              <div 
                key={i} 
                className="flex items-center space-x-3 animate-slide-in"
                style={{animationDelay: `${i * 100}ms`}}
              >
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="text-lg">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-secondary/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-white font-semibold">P</span>
            </div>
            <span className="font-semibold text-lg">ProjectSync</span>
          </div>
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} ProjectSync. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
