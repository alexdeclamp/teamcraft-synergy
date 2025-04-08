
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
      // Use a raw query approach to avoid type issues
      const { data, error } = await supabase
        .from('google_drive_connections')
        .select('*')
        .eq('user_id', user.id)
        .limit(1);
        
      if (!data || data.length === 0 || error) {
        setIsConnected(false);
        setUserInfo(null);
        return false;
      }
      
      const connection = data[0];
      setIsConnected(true);
      setUserInfo({
        name: connection.user_name,
        email: connection.user_email
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
