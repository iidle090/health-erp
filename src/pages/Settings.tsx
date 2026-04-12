import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export function Settings() {
  const { toast } = useToast();

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile saved",
      description: "Your profile information has been updated.",
    });
  };

  const handleSaveSystem = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "System settings saved",
      description: "The system configuration has been updated.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and system preferences.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <form onSubmit={handleSaveProfile}>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Update your personal information and email.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue="Admin User" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="admin@heatherp.local" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" defaultValue="+1 (555) 123-4567" />
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/50 px-6 py-4">
              <Button type="submit">Save Changes</Button>
            </CardFooter>
          </Card>
        </form>

        <form onSubmit={handleSaveSystem}>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>System Preferences</CardTitle>
              <CardDescription>Manage general system notifications and behavior.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="notif-email" className="flex flex-col space-y-1">
                  <span>Email Notifications</span>
                  <span className="font-normal text-sm text-muted-foreground">Receive daily digest emails.</span>
                </Label>
                <Switch id="notif-email" defaultChecked />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="notif-sms" className="flex flex-col space-y-1">
                  <span>SMS Alerts</span>
                  <span className="font-normal text-sm text-muted-foreground">Get notified for critical patient status changes.</span>
                </Label>
                <Switch id="notif-sms" defaultChecked />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="theme" className="flex flex-col space-y-1">
                  <span>Dark Mode</span>
                  <span className="font-normal text-sm text-muted-foreground">Switch between light and dark themes.</span>
                </Label>
                <Switch id="theme" />
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/50 px-6 py-4">
              <Button type="submit" variant="secondary">Save Preferences</Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
