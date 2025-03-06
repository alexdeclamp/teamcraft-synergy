
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';

type SettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const { user, profile } = useAuth();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Account Settings</DialogTitle>
          <DialogDescription>
            Manage your account preferences
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Personal Information</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <span className="text-sm">{user?.email}</span>
                  <Button size="sm" variant="ghost" className="h-7">Change</Button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <span className="text-sm">{profile?.full_name || 'Not set'}</span>
                  <Button size="sm" variant="ghost" className="h-7">Edit</Button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Preferences</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <div>
                  <p className="text-sm font-medium">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive updates about your projects</p>
                </div>
                <Button size="sm" variant="ghost" className="h-7">Configure</Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Account Security</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">Password</p>
                <Button size="sm" variant="ghost" className="h-7">Change</Button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <Button variant="destructive" size="sm">
            Delete Account
          </Button>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
