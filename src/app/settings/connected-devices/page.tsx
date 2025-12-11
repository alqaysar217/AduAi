
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Laptop, Smartphone, Tablet, LogOut, MoreVertical, Info } from 'lucide-react';

import { Button, buttonVariants } from '@/components/ui/button'; // Import buttonVariants
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'; // Added CardFooter
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns'; // Import format

// Define Device type
interface ConnectedDevice {
  id: string;
  type: 'Desktop' | 'Mobile' | 'Tablet' | 'Unknown';
  name: string; // e.g., "Chrome on Windows 10", "iPhone 14 Pro"
  location?: string; // Optional: e.g., "New York, USA" (requires IP lookup)
  lastAccessed: Date;
  isCurrentDevice?: boolean; // Flag for the device currently being used
}

// Mock data for connected devices (replace with actual data fetching)
const initialConnectedDevices: ConnectedDevice[] = [
  { id: 'dev-1', type: 'Desktop', name: 'Chrome on Windows 10', location: 'New York, USA', lastAccessed: new Date(), isCurrentDevice: true },
  { id: 'dev-2', type: 'Mobile', name: 'iPhone 14 Pro', location: 'London, UK', lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 24) },
  { id: 'dev-3', type: 'Tablet', name: 'Samsung Galaxy Tab S8', location: 'Paris, France', lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) },
   { id: 'dev-4', type: 'Unknown', name: 'Unknown Device', location: 'San Francisco, USA', lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) },
];

// Helper to get icon based on type
const getDeviceIcon = (type: ConnectedDevice['type']) => {
  switch (type) {
    case 'Desktop': return <Laptop className="h-5 w-5 flex-shrink-0 text-muted-foreground" />;
    case 'Mobile': return <Smartphone className="h-5 w-5 flex-shrink-0 text-muted-foreground" />;
    case 'Tablet': return <Tablet className="h-5 w-5 flex-shrink-0 text-muted-foreground" />;
    default: return <Info className="h-5 w-5 flex-shrink-0 text-muted-foreground" />; // Generic icon for unknown
  }
};

export default function ConnectedDevicesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>(initialConnectedDevices);

  const handleRemoveDevice = (deviceId: string, deviceName: string) => {
    // Simulate removing the device
    setConnectedDevices(prevDevices => prevDevices.filter(device => device.id !== deviceId));
    toast({
      title: "Device Removed",
      description: `Successfully logged out from ${deviceName}.`,
    });
    // Add actual API call logic here to invalidate the session for that device
  };

   const handleLogoutAll = () => {
       // Simulate logging out all devices except the current one
       const currentDevice = connectedDevices.find(d => d.isCurrentDevice);
       setConnectedDevices(currentDevice ? [currentDevice] : []);
       toast({
           title: "Logged Out Everywhere Else",
           description: "You have been logged out from all other devices.",
       });
        // Add API call logic here
   };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
       <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-background border-b">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Button>
        <div className="flex items-center gap-2">
          <Laptop className="h-6 w-6 text-primary" /> {/* Using Laptop icon for the page */}
          <h1 className="text-lg font-heading font-bold">Connected Devices</h1>
        </div>
         <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-5 w-5" />
              <span className="sr-only">Options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
             {/* Alert Dialog for Logout All */}
             <AlertDialog>
                 <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                       Logout All Other Devices
                    </DropdownMenuItem>
                 </AlertDialogTrigger>
                 <AlertDialogContent>
                    <AlertDialogHeader>
                       <AlertDialogTitle>Confirm Logout All</AlertDialogTitle>
                       <AlertDialogDescription>
                          Are you sure you want to log out from all other devices? You will remain logged in on this device.
                       </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                       <AlertDialogCancel>Cancel</AlertDialogCancel>
                       <AlertDialogAction onClick={handleLogoutAll} className={cn(buttonVariants({ variant: "destructive" }))}>
                           Logout All Others
                       </AlertDialogAction>
                    </AlertDialogFooter>
                 </AlertDialogContent>
             </AlertDialog>
             <DropdownMenuItem onClick={() => toast({ title: "Help clicked" })}>Help</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 flex flex-col">
         <Card className="card-base flex-1 flex flex-col overflow-hidden">
             <CardHeader className="pb-4">
                 <CardTitle className="text-xl font-heading">Manage Your Sessions</CardTitle>
                 <CardDescription>Review and manage the devices currently logged into your EduAI account.</CardDescription>
             </CardHeader>
             <CardContent className="flex-1 overflow-hidden p-0">
                  <ScrollArea className="h-full">
                      {connectedDevices.length > 0 ? (
                          <ul className="divide-y divide-border">
                              {connectedDevices.map((device) => (
                                  <li key={device.id} className="flex items-center justify-between p-4 hover:bg-muted/30">
                                       <div className="flex items-center gap-3">
                                          {getDeviceIcon(device.type)}
                                           <div className="flex-1">
                                              <p className="text-sm font-medium text-foreground">
                                                   {device.name}
                                                  {device.isCurrentDevice && (
                                                    <span className="ml-2 text-xs text-green-600 font-semibold">(Current Device)</span>
                                                  )}
                                              </p>
                                              <p className="text-xs text-muted-foreground">
                                                  {device.location ? `${device.location} • ` : ''}
                                                  Last accessed: {format(device.lastAccessed, 'Pp')}
                                              </p>
                                           </div>
                                      </div>
                                       {!device.isCurrentDevice && (
                                           <AlertDialog>
                                               <AlertDialogTrigger asChild>
                                                   <Button variant="outline" size="sm" className="h-8 text-xs">
                                                       <LogOut className="mr-1 h-3 w-3" /> Logout
                                                   </Button>
                                               </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                  <AlertDialogHeader>
                                                      <AlertDialogTitle>Log out from this device?</AlertDialogTitle>
                                                      <AlertDialogDescription>
                                                          Are you sure you want to log out the session on "{device.name}"?
                                                      </AlertDialogDescription>
                                                  </AlertDialogHeader>
                                                  <AlertDialogFooter>
                                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                      <AlertDialogAction
                                                        onClick={() => handleRemoveDevice(device.id, device.name)}
                                                        className={cn(buttonVariants({ variant: "destructive" }))}
                                                      >
                                                        Logout Device
                                                      </AlertDialogAction>
                                                  </AlertDialogFooter>
                                                </AlertDialogContent>
                                           </AlertDialog>
                                       )}
                                  </li>
                              ))}
                          </ul>
                     ) : (
                          <div className="flex flex-col items-center justify-center h-full p-10 text-center text-muted-foreground">
                             <Laptop className="h-16 w-16 mb-4 opacity-50" />
                             <p>No connected devices found.</p>
                             <p className="text-xs mt-1">Only this device is currently logged in.</p>
                          </div>
                     )}
                  </ScrollArea>
             </CardContent>
              <CardFooter className="border-t p-4 flex justify-end">
                  {/* Add footer actions if needed, e.g., Logout All button (already in menu) */}
                   <p className="text-xs text-muted-foreground text-center flex-1">
                        If you see any suspicious activity, consider changing your password.
                   </p>
              </CardFooter>
         </Card>
      </main>
    </div>
  );
}
