
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';

const VectorAnalyticsTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Analytics</CardTitle>
        <CardDescription>Vector search performance insights</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Search analytics coming soon...</p>
          <p className="text-sm">Track search patterns, result quality, and performance metrics</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VectorAnalyticsTab;
