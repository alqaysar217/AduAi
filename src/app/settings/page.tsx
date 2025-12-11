
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Edit,
  Languages,
  Palette, 
  Bell,
  Heart,
  FileText,
  Trash2,
  LogOut,
  Share2,
  ShieldCheck,
  DatabaseZap,
  History,
  ChevronRight,
  Sun, 
  Moon, 
  Laptop, 
  Settings as SettingsIcon,
} from 'lucide-react';

import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Removed CardDescription as it's not used here directly
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label'; 
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { cn } from '@/lib/utils'; 
import { useLanguage, type Language as AppLanguage } from '@/contexts/LanguageContext'; // Import useLanguage

const initialUserData = {
    username: '@pr.mahmoud',
    fullName: 'محمود الحساني',
    email: 'pr.mahmoud.20@gmail.com',
    profilePictureUrl: 'https://firebasestorage.googleapis.com/v0/b/eduai-simplified.appspot.com/o/profile%2Fdefault_user.jpg?alt=media&data-ai-hint=handsome%20young%20man%20cartoon',
};

type ThemePreference = 'light' | 'dark' | 'system'; // Added 'system'

const getInitialThemePreference = (): ThemePreference => {
  if (typeof window !== 'undefined') {
    const storedTheme = localStorage.getItem('theme') as ThemePreference | null;
    if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
      return storedTheme;
    }
  }
  return 'dark'; // Default to dark
};

const applyTheme = (themePreference: ThemePreference) => {
    if (typeof window === 'undefined') return;
    const docEl = document.documentElement;
    docEl.classList.remove('light', 'dark');
    
    if (themePreference === 'light') {
      // docEl.classList.add('light'); // Light is default if no dark class
    } else if (themePreference === 'dark') {
      docEl.classList.add('dark');
    } else { // system
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        docEl.classList.add('dark');
      } else {
        // docEl.classList.add('light'); // or remove dark
      }
    }
    console.log(`Applied theme: ${themePreference}`);
};

const saveThemePreference = (themePreference: ThemePreference) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', themePreference);
    }
};

const initialSettings = {
    generalNotifications: true,
    favoriteNotifications: true,
    cloudBackup: false,
    twoFactorAuth: false,
};

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t, language, setLanguage: setAppLanguage } = useLanguage(); // Get language state and setter

  const [userData] = useState(initialUserData); // Assuming this data doesn't change on this page
  const [settings, setSettingsState] = useState(() => {
      const initialThemePref = getInitialThemePreference();
      return {
          ...initialSettings,
          theme: initialThemePref,
          currentAppLanguage: language, // Initialize with context language
      };
  });

  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  // Sync local language state with context
  useEffect(() => {
    setSettingsState(prev => ({ ...prev, currentAppLanguage: language }));
  }, [language]);

  const handleEditProfile = () => {
    router.push('/profile');
  };

  const handleLanguageSettingClick = () => {
    router.push('/settings/language');
  };

  const handleThemeChange = (value: ThemePreference) => {
    setSettingsState(prev => ({ ...prev, theme: value }));
    saveThemePreference(value);
    toast({ title: t('settingsPage.themeChanged'), description: t('settingsPage.themeChangedDesc', { theme: value }) });
  };

  const handleNotificationToggle = (type: 'general' | 'favorite', value: boolean) => {
    setSettingsState(prev => ({
      ...prev,
      [type === 'general' ? 'generalNotifications' : 'favoriteNotifications']: value,
    }));
    toast({
        title: `${t(type === 'general' ? 'settingsPage.generalNotifications' : 'settingsPage.favoriteNotifications')} ${value ? t('settingsPage.enabled') : t('settingsPage.disabled')}`,
    });
  };

  const handleCloudBackupToggle = (value: boolean) => {
    setSettingsState(prev => ({ ...prev, cloudBackup: value }));
    toast({ title: `${t('settingsPage.cloudBackup')} ${value ? t('settingsPage.enabled') : t('settingsPage.disabled')}` });
  };

  const handle2FAToggle = (value: boolean) => {
      setSettingsState(prev => ({ ...prev, twoFactorAuth: value }));
      toast({ title: `${t('settingsPage.twoFactorAuth')} ${value ? t('settingsPage.enabled', {defaultValue: "Enabled"}) : t('settingsPage.disabled', {defaultValue: "Disabled"})} (Simulated)` });
      if (value) {
          toast({ title: '2FA Setup Required', description: 'Please complete the setup process.', duration: 5000 });
      }
  };

   const handleViewConnectedDevices = () => {
       router.push('/settings/connected-devices');
   };

   const handleViewActivityLog = () => {
      router.push('/settings/activity-log');
   };

   const handleDeleteAccount = () => {
      toast({
          title: t('settingsPage.deleteAccount') + ' (Simulated)',
          description: 'Your account has been permanently deleted.',
          variant: 'destructive',
       });
       setTimeout(() => router.push('/login'), 1500);
   };

    const handleLogout = () => {
        toast({ title: t('settingsPage.logoutSuccessTitle', {defaultValue: 'Logged Out'}), description: t('settingsPage.logoutSuccessDesc', {defaultValue: 'You have been successfully logged out.'}) });
        setTimeout(() => router.push('/login'), 1000);
    };

    const handleShareApp = () => {
        router.push('/settings/share');
    };

  const languageOptions = [
    { code: 'en', nameKey: 'languageSettingsPage.english', nativeName: 'English' },
    { code: 'ar', nameKey: 'languageSettingsPage.arabic', nativeName: 'العربية' },
  ];


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-background border-b">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft className={cn("h-5 w-5", language === 'ar' && "transform scale-x-[-1]")} />
          <span className="sr-only">{t('buttons.back')}</span>
        </Button>
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-heading font-bold">{t('settingsPage.title')}</h1>
        </div>
        <div className="w-8"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <Card className="card-base overflow-hidden">
          <CardHeader className="p-0">
              <div className="flex items-center gap-4 p-4 bg-muted/30">
                  <Avatar className="h-16 w-16 border-2 border-primary">
                    <AvatarImage src={userData.profilePictureUrl} alt={userData.username} data-ai-hint="handsome young man cartoon" />
                    <AvatarFallback><User className="h-8 w-8" /></AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold font-heading text-lg">{language === 'ar' ? userData.fullName : 'Mahmoud Al-Hassani'}</p>
                    <p className="text-sm text-muted-foreground">{userData.username}</p>
                    <p className="text-sm text-muted-foreground">{userData.email}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleEditProfile}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">{t('buttons.editProfile')}</span>
                  </Button>
              </div>
          </CardHeader>
        </Card>

        <div className="space-y-4">
            <Card className="card-base">
                <CardHeader><CardTitle className="text-base font-heading">{t('settingsPage.general')}</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-border">
                        <button onClick={handleLanguageSettingClick} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors w-full text-left">
                            <div className="flex items-center gap-3">
                                <Languages className="h-5 w-5 text-muted-foreground" />
                                <span className="text-sm">{t('settingsPage.language')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-sm text-muted-foreground">{languageOptions.find(l => l.code === settings.currentAppLanguage)?.nativeName}</span>
                                <ChevronRight className={cn("h-5 w-5 text-muted-foreground", language === 'ar' && "transform scale-x-[-1]")} />
                            </div>
                        </button>
                        <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                             <div className="flex items-center gap-3">
                                <Palette className="h-5 w-5 text-muted-foreground" />
                                <Label htmlFor="theme-select" className="text-sm cursor-pointer">{t('settingsPage.appearance')}</Label>
                            </div>
                             <Select value={settings.theme} onValueChange={(value) => handleThemeChange(value as ThemePreference)}>
                                <SelectTrigger id="theme-select" className="w-[150px] h-8 text-xs input-base">
                                    <SelectValue placeholder="Theme" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light"><div className="flex items-center gap-2"><Sun className="h-4 w-4" /> {t('settingsPage.lightTheme')}</div></SelectItem>
                                    <SelectItem value="dark"><div className="flex items-center gap-2"><Moon className="h-4 w-4" /> {t('settingsPage.darkTheme')}</div></SelectItem>
                                    <SelectItem value="system"><div className="flex items-center gap-2"><Laptop className="h-4 w-4" /> {t('settingsPage.automaticTheme')}</div></SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="card-base">
                <CardHeader><CardTitle className="text-base font-heading">{t('settingsPage.notifications')}</CardTitle></CardHeader>
                 <CardContent className="p-0">
                     <div className="divide-y divide-border">
                        <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-3">
                                 <Bell className="h-5 w-5 text-muted-foreground" />
                                <Label htmlFor="general-notifications" className="text-sm cursor-pointer">{t('settingsPage.generalNotifications')}</Label>
                            </div>
                            <Switch id="general-notifications" checked={settings.generalNotifications} onCheckedChange={(value) => handleNotificationToggle('general', value)} aria-label="Toggle General Notifications" />
                        </div>
                        <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                           <div className="flex items-center gap-3">
                                 <Heart className="h-5 w-5 text-muted-foreground" />
                                <Label htmlFor="favorite-notifications" className="text-sm cursor-pointer">{t('settingsPage.favoriteNotifications')}</Label>
                            </div>
                            <Switch id="favorite-notifications" checked={settings.favoriteNotifications} onCheckedChange={(value) => handleNotificationToggle('favorite', value)} aria-label="Toggle Favorite Notifications" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="card-base">
                 <CardHeader><CardTitle className="text-base font-heading">{t('settingsPage.dataAndSecurity')}</CardTitle></CardHeader>
                 <CardContent className="p-0">
                    <div className="divide-y divide-border">
                        <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                           <div className="flex items-center gap-3">
                                 <DatabaseZap className="h-5 w-5 text-muted-foreground" />
                                <Label htmlFor="cloud-backup" className="text-sm cursor-pointer">{t('settingsPage.cloudBackup')}</Label>
                            </div>
                            <Switch id="cloud-backup" checked={settings.cloudBackup} onCheckedChange={handleCloudBackupToggle} aria-label="Toggle Cloud Backup" />
                        </div>
                        <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-3">
                                 <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                                <Label htmlFor="two-factor-auth" className="text-sm cursor-pointer">{t('settingsPage.twoFactorAuth')}</Label>
                            </div>
                             <Switch id="two-factor-auth" checked={settings.twoFactorAuth} onCheckedChange={handle2FAToggle} aria-label="Toggle Two-Factor Authentication" />
                        </div>
                        <button onClick={handleViewConnectedDevices} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors w-full text-left">
                            <div className="flex items-center gap-3">
                                 <Laptop className="h-5 w-5 text-muted-foreground" />
                                <span className="text-sm">{t('settingsPage.connectedDevices')}</span>
                            </div>
                            <ChevronRight className={cn("h-5 w-5 text-muted-foreground", language === 'ar' && "transform scale-x-[-1]")} />
                        </button>
                         <button onClick={handleViewActivityLog} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors w-full text-left">
                             <div className="flex items-center gap-3">
                                  <History className="h-5 w-5 text-muted-foreground" />
                                 <span className="text-sm">{t('settingsPage.activityLog')}</span>
                             </div>
                             <ChevronRight className={cn("h-5 w-5 text-muted-foreground", language === 'ar' && "transform scale-x-[-1]")} />
                         </button>
                    </div>
                </CardContent>
            </Card>

            <Card className="card-base">
                 <CardHeader><CardTitle className="text-base font-heading">{t('settingsPage.aboutEduAI')}</CardTitle></CardHeader>
                 <CardContent className="p-0">
                    <div className="divide-y divide-border">
                         <Link href="/settings/terms" className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors w-full text-left">
                             <div className="flex items-center gap-3">
                                 <FileText className="h-5 w-5 text-muted-foreground" />
                                 <span className="text-sm">{t('settingsPage.termsOfService')}</span>
                             </div>
                             <ChevronRight className={cn("h-5 w-5 text-muted-foreground", language === 'ar' && "transform scale-x-[-1]")} />
                         </Link>
                          <Link href="/settings/privacy" className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors w-full text-left">
                             <div className="flex items-center gap-3">
                                 <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                                 <span className="text-sm">{t('settingsPage.privacyPolicy')}</span>
                             </div>
                              <ChevronRight className={cn("h-5 w-5 text-muted-foreground", language === 'ar' && "transform scale-x-[-1]")} />
                         </Link>
                         <button onClick={handleShareApp} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors w-full text-left">
                             <div className="flex items-center gap-3">
                                 <Share2 className="h-5 w-5 text-muted-foreground" />
                                 <span className="text-sm">{t('settingsPage.shareEduAI')}</span>
                             </div>
                              <ChevronRight className={cn("h-5 w-5 text-muted-foreground", language === 'ar' && "transform scale-x-[-1]")} />
                         </button>
                    </div>
                </CardContent>
            </Card>

            <Card className="card-base border-destructive/50">
                 <CardHeader><CardTitle className="text-base font-heading">{t('settingsPage.accountManagement')}</CardTitle></CardHeader>
                 <CardContent className="p-0">
                     <div className="divide-y divide-border">
                         <AlertDialog>
                             <AlertDialogTrigger asChild>
                                <button className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors w-full text-left text-destructive">
                                     <div className="flex items-center gap-3">
                                        <LogOut className="h-5 w-5" />
                                        <span className="text-sm font-medium">{t('settingsPage.logout')}</span>
                                    </div>
                                     <ChevronRight className={cn("h-5 w-5", language === 'ar' && "transform scale-x-[-1]")} />
                                </button>
                             </AlertDialogTrigger>
                             <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>{t('settingsPage.confirmLogoutTitle')}</AlertDialogTitle>
                                <AlertDialogDescription>{t('settingsPage.confirmLogoutDesc')}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('buttons.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleLogout} className={cn(buttonVariants({ variant: "destructive" }))}>{t('settingsPage.logout')}</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                         </AlertDialog>

                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <button className="flex items-center justify-between p-4 hover:bg-destructive/10 transition-colors w-full text-left text-destructive">
                                    <div className="flex items-center gap-3">
                                        <Trash2 className="h-5 w-5" />
                                        <span className="text-sm font-medium">{t('settingsPage.deleteAccount')}</span>
                                    </div>
                                    <ChevronRight className={cn("h-5 w-5", language === 'ar' && "transform scale-x-[-1]")} />
                                </button>
                            </AlertDialogTrigger>
                             <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>{t('settingsPage.confirmDeleteTitle')}</AlertDialogTitle>
                                <AlertDialogDescription>{t('settingsPage.confirmDeleteDesc')}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('buttons.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteAccount} className={cn(buttonVariants({ variant: "destructive" }))}>{t('settingsPage.deleteAccount')}</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                         </AlertDialog>
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
