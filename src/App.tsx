
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { OnboardingProvider } from "./contexts/OnboardingContext";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NewProject from "./pages/NewProject";
import Project from "./pages/Project";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import OnboardingSidebar from "./components/onboarding/OnboardingSidebar";
import WelcomeDialog from "./components/onboarding/WelcomeDialog";
import AppSidebar from "./components/AppSidebar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppSidebar />
          <Routes>
            {/* Public routes without onboarding */}
            <Route path="/" element={<Landing />} />
            <Route path="/home" element={<Index />} />
            <Route path="/auth" element={<Auth />} />

            {/* Protected routes with onboarding */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <OnboardingProvider>
                  <OnboardingSidebar />
                  <WelcomeDialog />
                  <div className="pl-16">
                    <Dashboard />
                  </div>
                </OnboardingProvider>
              </ProtectedRoute>
            } />
            <Route path="/new-project" element={
              <ProtectedRoute>
                <OnboardingProvider>
                  <OnboardingSidebar />
                  <WelcomeDialog />
                  <div className="pl-16">
                    <NewProject />
                  </div>
                </OnboardingProvider>
              </ProtectedRoute>
            } />
            <Route path="/project/:id" element={
              <ProtectedRoute>
                <OnboardingProvider>
                  <OnboardingSidebar />
                  <WelcomeDialog />
                  <div className="pl-16">
                    <Project />
                  </div>
                </OnboardingProvider>
              </ProtectedRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
