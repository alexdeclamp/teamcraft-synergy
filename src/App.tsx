
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <OnboardingProvider>
            <OnboardingSidebar />
            <WelcomeDialog />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/home" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/new-project" element={
                <ProtectedRoute>
                  <NewProject />
                </ProtectedRoute>
              } />
              <Route path="/project/:id" element={
                <ProtectedRoute>
                  <Project />
                </ProtectedRoute>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </OnboardingProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
