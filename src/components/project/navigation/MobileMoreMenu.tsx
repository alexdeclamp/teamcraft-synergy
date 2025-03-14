
import React from 'react';
import { Users, Settings, MoreHorizontal } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

interface MobileMoreMenuProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: string | null;
}

const MobileMoreMenu: React.FC<MobileMoreMenuProps> = ({
  activeTab,
  onTabChange,
  userRole
}) => {
  // These are the overflow tabs that don't fit in the main bottom nav
  const overflowTabs = [
    { id: 'members', label: 'Team Members', icon: Users },
  ];
  
  // Only show settings tab for owners
  if (userRole === 'owner') {
    overflowTabs.push({ id: 'settings', label: 'Project Settings', icon: Settings });
  }

  const handleTabChange = (tabId: string) => {
    onTabChange(tabId);
  };

  return (
    <Drawer>
      <DrawerTrigger className={cn(
        "flex flex-col items-center justify-center py-2 px-1",
        activeTab === 'members' || activeTab === 'settings'
          ? "text-primary"
          : "text-muted-foreground"
      )}>
        <MoreHorizontal className="h-5 w-5 mb-1" />
        <span className="text-xs font-medium">More</span>
      </DrawerTrigger>
      <DrawerContent className="px-4 pb-8">
        <div className="pt-4 pb-2">
          <h4 className="text-lg font-medium text-center mb-4">Project Navigation</h4>
          <div className="space-y-1">
            {overflowTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "flex items-center w-full p-3 rounded-md",
                  activeTab === tab.id
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted"
                )}
              >
                <tab.icon className="h-5 w-5 mr-3" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileMoreMenu;
