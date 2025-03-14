
import React from 'react';
import { LayoutDashboard, Pencil, Bell, File, Image, Users, Settings } from 'lucide-react';
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: string | null;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ 
  activeTab, 
  onTabChange,
  userRole
}) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'notes', label: 'Notes', icon: Pencil },
    { id: 'updates', label: 'Updates', icon: Bell },
    { id: 'documents', label: 'Docs', icon: File },
    { id: 'images', label: 'Images', icon: Image },
    { id: 'members', label: 'Team', icon: Users },
  ];
  
  // Only show settings tab for owners
  if (userRole === 'owner') {
    tabs.push({ id: 'settings', label: 'Settings', icon: Settings });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-40 pb-safe">
      <div className="grid grid-cols-5 gap-1">
        {tabs.slice(0, 5).map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex flex-col items-center justify-center py-2 px-1",
              activeTab === tab.id 
                ? "text-primary" 
                : "text-muted-foreground"
            )}
          >
            <tab.icon className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileBottomNav;
