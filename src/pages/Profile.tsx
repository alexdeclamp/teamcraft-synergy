
import React from 'react';
import { UserCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Profile = () => {
  return (
    <div className="container py-8 max-w-5xl mx-auto">
      <div className="mb-8 flex items-center">
        <h1 className="text-3xl font-bold">Profile</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <UserCircle className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Your profile details will appear here.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Account settings and preferences will appear here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
