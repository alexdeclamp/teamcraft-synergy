
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  FileText, 
  Bell, 
  FileIcon, 
  Image, 
  Users, 
  Settings,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: string | null;
  projectTitle?: string;
}

const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  activeTab,
  onTabChange,
  userRole,
  projectTitle
}) => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: "Overview",
      value: "overview",
      icon: LayoutDashboard,
    },
    {
      title: "Notes",
      value: "notes",
      icon: FileText,
    },
    {
      title: "Updates",
      value: "updates",
      icon: Bell,
    },
    {
      title: "Documents",
      value: "documents",
      icon: FileIcon,
    },
    {
      title: "Images",
      value: "images",
      icon: Image,
    },
    {
      title: "Members",
      value: "members",
      icon: Users,
    },
  ];

  // Add settings if user is owner
  if (userRole === 'owner') {
    menuItems.push({
      title: "Settings",
      value: "settings",
      icon: Settings,
    });
  }

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <Sidebar>
      <SidebarContent>
        <div className="p-4 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToDashboard}
            className="mb-2 text-muted-foreground hover:text-foreground w-full justify-start"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          {projectTitle && (
            <h2 className="font-semibold text-lg truncate">{projectTitle}</h2>
          )}
        </div>
        
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton 
                    isActive={activeTab === item.value}
                    onClick={() => onTabChange(item.value)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default ProjectSidebar;
