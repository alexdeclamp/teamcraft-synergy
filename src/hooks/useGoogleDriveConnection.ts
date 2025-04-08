
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useGoogleDriveConnection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);
  const [userInfo, setUserInfo] = useState<{ name?: string; email?: string } | null>(null);
  
  const checkGoogleDriveConnection = async () => {
    if (!user) return false;
    
    setIsCheckingConnection(true);
    try {
      const { data, error } = await supabase
        .from('google_drive_connections')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (!data || error) {
        setIsConnected(false);
        setUserInfo(null);
        return false;
      }
      
      setIsConnected(true);
      setUserInfo({
        name: data.user_name,
        email: data.user_email
      });
      return true;
    } catch (err) {
      console.error("Error checking Google Drive connection:", err);
      setIsConnected(false);
      setUserInfo(null);
      return false;
    } finally {
      setIsCheckingConnection(false);
    }
  };
  
  useEffect(() => {
    if (user) {
      checkGoogleDriveConnection();
    } else {
      setIsConnected(false);
      setUserInfo(null);
      setIsCheckingConnection(false);
    }
  }, [user]);
  
  return {
    isConnected,
    isCheckingConnection,
    userInfo,
    checkGoogleDriveConnection
  };
};

export default useGoogleDriveConnection;
