
import React from 'react';
import Navbar from '@/components/Navbar';
import VectorDatabaseDashboard from '@/components/notes/VectorDatabaseDashboard';

const VectorDatabase: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-16 sm:pt-20">
        <VectorDatabaseDashboard />
      </main>
    </div>
  );
};

export default VectorDatabase;
