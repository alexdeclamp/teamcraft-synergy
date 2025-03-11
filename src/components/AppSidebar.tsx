
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  PlusCircle,
  BrainCircuit 
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const AppSidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Only show the sidebar on protected routes
  const isProtectedRoute = 
    location.pathname.startsWith('/dashboard') || 
    location.pathname.startsWith('/project') ||
    location.pathname.startsWith('/new-project');
  
  if (!isProtectedRoute || !user) {
    return null;
  }
  
  const navItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/dashboard',
    },
    {
      icon: PlusCircle,
      label: 'New Brain',
      path: '/new-project',
    },
  ];

  return (
    <div className={cn(
      "fixed left-0 top-0 z-40 h-full w-16 bg-background border-r transition-all animate-slide-in-left",
      "flex flex-col items-center py-6 px-2"
    )}>
      <div className="flex items-center justify-center mb-6">
        <BrainCircuit className="h-8 w-8 text-primary" />
      </div>
      
      <nav className="flex flex-col items-center space-y-4 flex-1">
        <TooltipProvider>
          {navItems.map((item) => (
            <Tooltip key={item.path}>
              <TooltipTrigger asChild>
                <Link to={item.path}>
                  <Button
                    variant={location.pathname === item.path ? "default" : "ghost"}
                    size="icon"
                    className="h-10 w-10 rounded-md"
                    aria-label={item.label}
                  >
                    <item.icon className="h-5 w-5" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>
    </div>
  );
};

export default AppSidebar;
