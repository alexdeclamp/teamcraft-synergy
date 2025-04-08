
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Auth from './pages/Auth';
import Integrations from './pages/Integrations';
import NotionConnect from './pages/NotionConnect';
import NotionImport from './pages/NotionImport';
import GoogleDriveConnect from './pages/GoogleDriveConnect';
import GoogleDriveImport from './pages/GoogleDriveImport';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Integrations />} />
          <Route path="/integrations" element={<Integrations />} />
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
      </AuthProvider>
    </Router>
  );
}

export default App;
