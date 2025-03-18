
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';

// Pages
import Landing from '@/pages/Landing';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Project from '@/pages/Project';
import NewProject from '@/pages/NewProject';
import NotFound from '@/pages/NotFound';
import SummarizeDemo from '@/pages/SummarizeDemo';
import Brand from '@/pages/Brand';
import BrandAssets from '@/pages/BrandAssets';
import Waitlist from '@/pages/Waitlist';
import Sitemap from '@/pages/Sitemap';
import Index from '@/pages/Index';

// Components
import ProtectedRoute from '@/components/ProtectedRoute';

// Create a client
const queryClient = new QueryClient();

const App = () => {
  return (
    <Router>
      <ThemeProvider defaultTheme="light">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <OnboardingProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/landing" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/waitlist" element={<Waitlist />} />
                <Route path="/summarize-demo" element={<SummarizeDemo />} />
                <Route path="/brand" element={<Brand />} />
                <Route path="/brand/assets" element={<BrandAssets />} />
                <Route path="/sitemap" element={<Sitemap />} />
                
                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/project/:id" 
                  element={
                    <ProtectedRoute>
                      <Project />
                    </ProtectedRoute>
                  } 
                />
                <Route
                  path="/new-project"
                  element={
                    <ProtectedRoute>
                      <NewProject />
                    </ProtectedRoute>
                  }
                />
                
                {/* Not Found */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </OnboardingProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
