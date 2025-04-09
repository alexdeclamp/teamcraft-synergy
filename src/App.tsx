
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import ProtectedRoute from './components/ProtectedRoute';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Integrations from './pages/Integrations';
import NotionConnect from './pages/NotionConnect';
import NotionImport from './pages/NotionImport';
import GoogleDriveConnect from './pages/GoogleDriveConnect';
import GoogleDriveImport from './pages/GoogleDriveImport';
import Index from './pages/Index';
import Landing from './pages/Landing';
import SummarizeDemo from './pages/SummarizeDemo';

function App() {
  return (
    <Router>
      <AuthProvider>
        <OnboardingProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/summarize" element={<SummarizeDemo />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/integrations" element={
              <ProtectedRoute>
                <Integrations />
              </ProtectedRoute>
            } />
            <Route path="/notion-connect" element={
              <ProtectedRoute>
                <NotionConnect />
              </ProtectedRoute>
            } />
            <Route path="/notion-import" element={
              <ProtectedRoute>
                <NotionImport />
              </ProtectedRoute>
            } />
            <Route path="/google-drive-connect" element={
              <ProtectedRoute>
                <GoogleDriveConnect />
              </ProtectedRoute>
            } />
            <Route path="/google-drive-import" element={
              <ProtectedRoute>
                <GoogleDriveImport />
              </ProtectedRoute>
            } />
          </Routes>
        </OnboardingProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
