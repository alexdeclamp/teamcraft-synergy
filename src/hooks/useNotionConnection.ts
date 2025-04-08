
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useNotionConnection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);
  
  const checkNotionConnection = async () => {
    if (!user) return false;
    
    setIsCheckingConnection(true);
    try {
      const { data, error } = await supabase
        .from('notion_connections')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (!data || error) {
        setIsConnected(false);
        return false;
      }
      
      setIsConnected(true);
      return true;
    } catch (err) {
      console.error("Error checking Notion connection:", err);
      setIsConnected(false);
      return false;
    } finally {
      setIsCheckingConnection(false);
    }
  };
  
  useEffect(() => {
    const checkConnection = async () => {
      const connected = await checkNotionConnection();
      if (!connected) {
        toast.error("You need to connect to Notion first");
        navigate('/notion-connect');
      }
    };
    
    if (user) {
      checkConnection();
    }
  }, [user, navigate]);
  
  return {
    isConnected,
    isCheckingConnection,
    checkNotionConnection
  };
};

export default useNotionConnection;
