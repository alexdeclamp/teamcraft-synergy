
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Database, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const DatabaseSetup = () => {
  const [checking, setChecking] = useState(false);
  const [tableExists, setTableExists] = useState<boolean | null>(null);
  
  const checkSubscriptionTable = async () => {
    setChecking(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('check-db-schema');
      
      if (error) {
        console.error('Error checking database schema:', error);
        toast.error('Failed to check database schema');
        setTableExists(false);
        return;
      }
      
      if (data.status === 'success') {
        toast.success(data.message);
        setTableExists(true);
      } else {
        toast.error(data.message || 'Failed to verify database schema');
        setTableExists(false);
      }
    } catch (error) {
      console.error('Error in database setup:', error);
      toast.error('An unexpected error occurred');
      setTableExists(false);
    } finally {
      setChecking(false);
    }
  };
  
  // Automatically check on component mount
  useEffect(() => {
    checkSubscriptionTable();
  }, []);
  
  return (
    <div className="p-4 border rounded-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Database Setup</h3>
        {tableExists === true && <CheckCircle2 className="h-5 w-5 text-green-500" />}
      </div>
      
      <p className="text-sm text-gray-500 mb-4">
        Verify that all required database tables are properly set up for the subscription system.
      </p>
      
      <div className="flex items-center gap-4">
        <Button
          onClick={checkSubscriptionTable}
          disabled={checking}
          variant={tableExists ? "outline" : "default"}
          className="flex gap-2"
        >
          {checking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Database className="h-4 w-4" />
          )}
          {tableExists ? "Verify Again" : "Check & Setup Tables"}
        </Button>
        
        {tableExists === false && (
          <span className="text-sm text-red-500">
            Table setup required. Click the button to create missing tables.
          </span>
        )}
      </div>
    </div>
  );
};

export default DatabaseSetup;
