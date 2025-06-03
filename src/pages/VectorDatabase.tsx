
import React from 'react';
import Navbar from '@/components/Navbar';
import VectorDatabaseDashboard from '@/components/notes/VectorDatabaseDashboard';

const VectorDatabase: React.FC = () => {
  console.log('VectorDatabase page rendering...');
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-16 sm:pt-20">
        <div className="py-4">
          <h1 className="text-2xl font-bold mb-4">Vector Database</h1>
          <VectorDatabaseDashboard />
        </div>
      </main>
    </div>
  );
};

export default VectorDatabase;
