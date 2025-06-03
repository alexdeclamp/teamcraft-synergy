
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Project from "./pages/Project";
import NewProject from "./pages/NewProject";
import Integrations from "./pages/Integrations";
import NotionConnect from "./pages/NotionConnect";
import NotionImport from "./pages/NotionImport";
import GoogleDriveConnect from "./pages/GoogleDriveConnect";
import GoogleDriveImport from "./pages/GoogleDriveImport";
import SummarizeDemo from "./pages/SummarizeDemo";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import Brand from "./pages/Brand";
import BrandAssets from "./pages/BrandAssets";
import Sitemap from "./pages/Sitemap";
import NotFound from "./pages/NotFound";
import VectorDatabase from "./pages/VectorDatabase";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <OnboardingProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/landing" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/project/:id" element={<ProtectedRoute><Project /></ProtectedRoute>} />
                <Route path="/new-project" element={<ProtectedRoute><NewProject /></ProtectedRoute>} />
                <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
                <Route path="/notion/connect" element={<ProtectedRoute><NotionConnect /></ProtectedRoute>} />
                <Route path="/notion/import" element={<ProtectedRoute><NotionImport /></ProtectedRoute>} />
                <Route path="/google-drive/connect" element={<ProtectedRoute><GoogleDriveConnect /></ProtectedRoute>} />
                <Route path="/google-drive/import" element={<ProtectedRoute><GoogleDriveImport /></ProtectedRoute>} />
                <Route path="/vector-database" element={<ProtectedRoute><VectorDatabase /></ProtectedRoute>} />
                <Route path="/summarize-demo" element={<SummarizeDemo />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfUse />} />
                <Route path="/brand" element={<Brand />} />
                <Route path="/brand/assets" element={<BrandAssets />} />
                <Route path="/sitemap" element={<Sitemap />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </OnboardingProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
