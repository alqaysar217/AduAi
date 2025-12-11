
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Bell, // Icon for Notifications page
  Home,
  Heart,
  User,
  Eye, // Icon for Show button
  X, // Icon for Dismiss button
  Info, // Example type icon
  AlertTriangle, // Example type icon
  MessageSquare, // Example type icon
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns'; // For relative timestamps

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext'; // Added
import { cn } from '@/lib/utils'; // Added

// Define Notification type
interface NotificationItem {
  id: string;
  name: string;
  type: 'Update' | 'Alert' | 'Message' | 'Reminder'; // Example types
  timestamp: Date;
  text: string;
  read: boolean; // To style read/unread notifications
}

// Mock data for notifications (replace with actual data fetching)
const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    name: 'New Feature Available',
    type: 'Update',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    text: 'Check out the enhanced Video Summarizer tool with new language support.',
    read: false,
  },
  {
    id: 'notif-2',
    name: 'Assignment Reminder',
    type: 'Reminder',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    text: 'Your essay submission for "AI Ethics" is due tomorrow.',
    read: false,
  },
  {
    id: 'notif-3',
    name: 'System Maintenance',
    type: 'Alert',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    text: 'Scheduled maintenance tonight from 2 AM to 3 AM. EduAI might be temporarily unavailable.',
    read: true,
  },
   {
    id: 'notif-4',
    name: 'Message from Tutor',
    type: 'Message',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    text: 'Your recent code submission has been reviewed. See feedback attached.',
    read: true,
  },
   {
    id: 'notif-5',
    name: 'Weekly Progress Report',
    type: 'Update',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    text: 'You have completed 5 modules this week. Keep up the great work!',
    read: true,
  },
];

// Helper to get icon based on type
const getTypeIcon = (type: NotificationItem['type']) => {
  switch (type) {
    case 'Update': return <Info className="h-4 w-4" />;
    case 'Alert': return <AlertTriangle className="h-4 w-4 text-warning" />; // Use warning color for alerts
    case 'Message': return <MessageSquare className="h-4 w-4" />;
    case 'Reminder': return <Bell className="h-4 w-4" />; // Using Bell for Reminder
    default: return <Bell className="h-4 w-4" />;
  }
};

// Helper to get badge variant based on type
const getTypeBadgeVariant = (type: NotificationItem['type']): React.ComponentProps<typeof Badge>['variant'] => {
  switch (type) {
    case 'Update': return 'secondary';
    case 'Alert': return 'warning'; // Custom variant needed or use destructive/secondary
    case 'Message': return 'accent';
    case 'Reminder': return 'default'; // Use primary color for reminders
    default: return 'secondary';
  }
};


export default function NotificationsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { language, t } = useLanguage(); // Added
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  const handleDismiss = (notificationId: string, notificationName: string) => {
    setNotifications(prevNotifications => prevNotifications.filter(n => n.id !== notificationId));
    toast({
      titleKey: "notificationsPage.notificationDismissed",
      descriptionKey: "notificationsPage.notificationDismissedDesc",
      titleReplacements: { notificationName: notificationName } // Assuming your t function handles this
    });
  };

  const handleShowDetails = (notification: NotificationItem) => {
    // Mark as read when shown (optional)
     setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));

    toast({
      title: notification.name,
      description: notification.text, // Show full text in toast for demo
      duration: 5000, // Longer duration for reading
    });
    // In a real app, this might open a modal or navigate to a detail page
  };

   const handleMarkAllRead = () => {
     setNotifications(prev => prev.map(n => ({ ...n, read: true })));
     toast({ titleKey: "notificationsPage.markedAllAsRead" });
   };

    const handleClearAll = () => {
        setNotifications([]);
        toast({ titleKey: "notificationsPage.allNotificationsCleared" });
    };


  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-background border-b">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft className={cn("h-5 w-5", (language === 'ar' || language === 'ur') && "transform scale-x-[-1]")} />
          <span className="sr-only">{t('buttons.back')}</span>
        </Button>

        {/* Page Title and Icon */}
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary" />
          <span className="font-heading text-lg font-bold">{t('notificationsPage.title')}</span>
        </div>

        {/* Placeholder / Actions */}
         {notifications.length > 0 ? (
            <div className="flex gap-1">
                 <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-xs h-8">
                     {t('buttons.markAllRead')}
                 </Button>
                 <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                    {t('buttons.clearAll')}
                 </Button>
            </div>
         ) : (
             <div className="w-16"></div> // Placeholder for alignment if no buttons
         )}

      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20"> {/* Add padding-bottom for nav */}
        {notifications.length === 0 ? (
          <div className="text-center text-muted-foreground mt-20">
            <Bell className="mx-auto h-16 w-16 mb-4" />
            <p className="text-lg mb-2">{t('notificationsPage.noNewNotifications')}</p>
            <p>{t('notificationsPage.allCaughtUp')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map(notification => (
              <Card
                key={notification.id}
                className={`card-base transition-colors ${!notification.read ? 'border-primary border-l-4' : 'border'}`} // Highlight unread
              >
                <CardHeader className="pb-2">
                   <div className="flex items-center justify-between mb-1">
                     <div className="flex items-center gap-2">
                        {getTypeIcon(notification.type)}
                        <CardTitle className="text-base font-heading">{notification.name}</CardTitle>
                     </div>
                     <Badge variant={getTypeBadgeVariant(notification.type)} className="text-xs">
                        {notification.type}
                     </Badge>
                   </div>
                   <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                   </p>
                </CardHeader>
                <CardContent className="pb-3 pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2">{notification.text}</p>
                </CardContent>
                 <Separator className="mb-3" />
                <CardFooter className="flex justify-end gap-2 pt-0 pb-3 px-4">
                   <Button variant="ghost" size="sm" onClick={() => handleDismiss(notification.id, notification.name)}>
                     <X className="mr-1 h-4 w-4" /> {t('buttons.dismiss')}
                   </Button>
                   <Button variant="outline" size="sm" onClick={() => handleShowDetails(notification)}>
                     <Eye className="mr-1 h-4 w-4" /> {t('buttons.show')}
                   </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-10 flex justify-around h-16 bg-background border-t">
        <Link href="/dashboard" className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary pt-2 pb-1">
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">{t('dashboard.home')}</span>
        </Link>
        <Link href="/favorites" className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary pt-2 pb-1">
          <Heart className="h-6 w-6" />
          <span className="text-xs mt-1">{t('dashboard.favorites')}</span>
        </Link>
         <Link href="/notifications" className="flex flex-col items-center justify-center text-primary pt-2 pb-1"> {/* Active State */}
            <div className="relative">
               <Bell className="h-6 w-6" />
               {/* Show badge only if there are unread notifications */}
                {notifications.some(n => !n.read) && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-background bg-destructive"></span>
                )}
            </div>
          <span className="text-xs mt-1">{t('dashboard.notifications')}</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary pt-2 pb-1">
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">{t('dashboard.profile')}</span>
        </Link>
      </nav>
    </div>
  );
}
