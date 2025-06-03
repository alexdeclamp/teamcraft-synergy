
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
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
import Project from './pages/Project';
import NewProject from './pages/NewProject';

function App() {
  return (
    <Router>
      <AuthProvider>
        <OnboardingProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/landing" replace />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/index" element={<Index />} />
            <Route path="/summarize" element={<SummarizeDemo />} />
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
            <Route path="/project/:id" element={
              <ProtectedRoute>
                <Project />
              </ProtectedRoute>
            } />
          </Routes>
        </OnboardingProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
