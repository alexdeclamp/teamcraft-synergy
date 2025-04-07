
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
import Sitemap from "./pages/Sitemap";
import Brand from "./pages/Brand";
import BrandAssets from "./pages/BrandAssets";
import SummarizeDemo from "./pages/SummarizeDemo";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
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
          <Routes>
            {/* Public routes without onboarding */}
            <Route path="/" element={<Landing />} />
            <Route path="/home" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/sitemap" element={<Sitemap />} />
            <Route path="/brand" element={<Brand />} />
            <Route path="/brand-assets" element={<BrandAssets />} />
            <Route path="/summarize" element={<SummarizeDemo />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfUse />} />

            {/* Protected routes with onboarding */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <OnboardingProvider>
                  <OnboardingSidebar />
                  <WelcomeDialog />
                  <Dashboard />
                </OnboardingProvider>
              </ProtectedRoute>
            } />
            <Route path="/new-project" element={
              <ProtectedRoute>
                <OnboardingProvider>
                  <OnboardingSidebar />
                  <WelcomeDialog />
                  <NewProject />
                </OnboardingProvider>
              </ProtectedRoute>
            } />
            <Route path="/project/:id" element={
              <ProtectedRoute>
                <OnboardingProvider>
                  <OnboardingSidebar />
                  <WelcomeDialog />
                  <Project />
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
