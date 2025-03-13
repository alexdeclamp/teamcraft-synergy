
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowRight, ExternalLink } from 'lucide-react';

const Sitemap = () => {
  // Group routes by category
  const publicRoutes = [
    { path: '/', name: 'Landing Page', description: 'Main marketing page' },
    { path: '/home', name: 'Home', description: 'Application entry point' },
    { path: '/auth', name: 'Authentication', description: 'Login and registration' },
    { path: '/waitlist', name: 'Waitlist', description: 'Join our waitlist' },
    { path: '/sitemap', name: 'Sitemap', description: 'Overview of all pages' },
  ];

  const authenticatedRoutes = [
    { path: '/dashboard', name: 'Dashboard', description: 'Overview of your brains' },
    { path: '/new-project', name: 'New Project', description: 'Create a new brain' },
    { path: '/project/:id', name: 'Project Details', description: 'View and manage a specific brain' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-4">Sitemap</h1>
          <p className="text-muted-foreground">
            A comprehensive overview of all pages and sections in the Bra<span className="text-primary">3</span>n application.
          </p>
        </div>

        <div className="grid gap-10">
          {/* Public Routes */}
          <section>
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Public Pages</h2>
            <div className="grid gap-4">
              {publicRoutes.map((route) => (
                <div key={route.path} className="p-4 rounded-lg border group hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{route.name}</h3>
                    <Link to={route.path}>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        Visit <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                  <p className="text-sm text-muted-foreground">{route.description}</p>
                  <div className="mt-2 text-sm font-mono text-muted-foreground">{route.path}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Authenticated Routes */}
          <section>
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Authenticated Pages</h2>
            <div className="grid gap-4">
              {authenticatedRoutes.map((route) => (
                <div key={route.path} className="p-4 rounded-lg border group hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{route.name}</h3>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" disabled className="opacity-50">
                        Login Required <ExternalLink className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{route.description}</p>
                  <div className="mt-2 text-sm font-mono text-muted-foreground">{route.path}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Sitemap;
