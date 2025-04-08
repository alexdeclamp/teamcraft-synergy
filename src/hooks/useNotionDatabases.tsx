
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database } from 'lucide-react';

export interface NotionDatabase {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  created_time: string;
  last_edited_time: string;
}

export const useNotionDatabases = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [databases, setDatabases] = useState<NotionDatabase[]>([]);
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fetchDatabases = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Fetching Notion databases...");
      const { data, error } = await supabase.functions.invoke('notion-list-databases', {
        body: { userId: user.id }
      });
      
      if (error) throw error;
      
      console.log("Notion databases response:", data);
      
      if (data.databases && Array.isArray(data.databases)) {
        if (data.databases.length === 0) {
          setError("No databases found in your Notion workspace. Make sure you have created databases in Notion and have permission to access them.");
        }
        setDatabases(data.databases);
      } else {
        setDatabases([]);
        setError("No databases found. Please check your Notion connection.");
      }
      
    } catch (err) {
      console.error("Error fetching Notion databases:", err);
      toast.error("Failed to load Notion databases");
      setDatabases([]);
      setError("An error occurred while fetching your Notion databases. Please try reconnecting to Notion.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to render database icon
  const renderIcon = (icon: string | null) => {
    if (!icon) return <Database className="h-4 w-4 mr-1" />;
    
    if (typeof icon === 'string') {
      if (icon.length <= 2) {
        return <span className="mr-2">{icon}</span>;
      } else {
        return <img src={icon} alt="icon" className="h-4 w-4 mr-2 object-contain" />;
      }
    }
    
    return <Database className="h-4 w-4 mr-1" />;
  };
  
  return {
    isLoading,
    databases,
    selectedDatabase,
    setSelectedDatabase,
    fetchDatabases,
    renderIcon,
    error
  };
};

export default useNotionDatabases;
