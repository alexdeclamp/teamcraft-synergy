
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Download,
  Upload,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

const VectorToolsTab: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Export Embeddings</CardTitle>
          <CardDescription>Download embedding data for backup or analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Export Vector Data
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Import Embeddings</CardTitle>
          <CardDescription>Restore embedding data from backup</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full">
            <Upload className="mr-2 h-4 w-4" />
            Import Vector Data
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Health Check</CardTitle>
          <CardDescription>Verify embedding integrity and quality</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Run Health Check
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Optimize Database</CardTitle>
          <CardDescription>Clean up and optimize vector storage</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Optimize Vectors
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VectorToolsTab;
