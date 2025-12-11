
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  ArrowLeft,
  User,
  Edit,
  Save,
  Camera,
  KeyRound, // Icon for Change Password
  Home,
  Heart,
  Bell,
  // Add other relevant icons if needed
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose, // Added DialogClose
} from "@/components/ui/dialog";
import { useLanguage } from '@/contexts/LanguageContext'; // Added
import { cn } from '@/lib/utils'; // Added

// Mock data for demonstration
const initialUserData = {
    username: '@pr.mahmoud',
    fullName: 'محمود الحساني',
    email: 'pr.mahmoud.20@gmail.com',
    profilePictureUrl: 'https://firebasestorage.googleapis.com/v0/b/eduai-simplified.appspot.com/o/profile%2Fdefault_user.jpg?alt=media&data-ai-hint=handsome%20young%20man%20cartoon',
    description: 'Eager to learn new things using AI!',
};

// Zod schema for profile form validation
const profileSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters.' }),
  fullName: z.string().min(1, { message: 'Please enter your full name.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  description: z.string().max(150, { message: 'Description cannot exceed 150 characters.' }).optional(),
  profilePictureUrl: z.string().url({ message: 'Invalid image URL.' }).optional(), // Optional for now
});
type ProfileFormValues = z.infer<typeof profileSchema>;

// Zod schema for change password form validation
const changePasswordSchema = z.object({
    currentPassword: z.string().min(6, { message: 'Please enter your current password.' }),
    newPassword: z.string().min(6, { message: 'New password must be at least 6 characters.' }),
    confirmPassword: z.string().min(6, { message: 'Please confirm your new password.' }),
})
.refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match",
    path: ["confirmPassword"], // Path of error
});
type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { language, t } = useLanguage(); // Added
  const [userData, setUserData] = useState(initialUserData);
  const [isEditing, setIsEditing] = useState(false);

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: userData,
  });

  // Change password form
  const passwordForm = useForm<ChangePasswordFormValues>({
      resolver: zodResolver(changePasswordSchema),
      defaultValues: {
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
      },
  });

  const handleEditToggle = () => {
    if (isEditing) {
      // If currently editing, reset form to original data
      profileForm.reset(userData);
    } else {
        // If starting to edit, make sure form has latest data
        profileForm.reset(userData);
    }
    setIsEditing(!isEditing);
  };

  const onProfileSubmit = (values: ProfileFormValues) => {
    // Handle profile update logic here (e.g., API call)
    console.log('Profile updated:', values);
    setUserData(values); // Update local state with new values
    setIsEditing(false); // Exit editing mode
    toast({
      titleKey: 'profilePage.profileUpdated',
      descriptionKey: 'profilePage.profileUpdatedDesc',
    });
  };

   const onPasswordSubmit = (values: ChangePasswordFormValues) => {
       // Handle password change logic here (e.g., API call)
       console.log('Password change requested:', values.newPassword);
       // Simulate success
       toast({
           titleKey: "profilePage.passwordChanged",
           descriptionKey: "profilePage.passwordChangedDesc",
       });
       passwordForm.reset(); // Clear the form
       // Close the dialog manually if needed, or use DialogClose inside the button
       // Note: The Dialog might close automatically on form submission depending on setup.
       // If it doesn't, you might need state to control the Dialog's open prop.
       document.getElementById('changePasswordDialogClose')?.click(); // Find and click the close button
   };

  const handleImageEdit = () => {
      toast({ titleKey: 'profilePage.editImage', description: 'Image editing functionality not implemented yet.' });
      // Logic to open image picker/uploader
  };


  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-background border-b">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft className={cn("h-5 w-5", (language === 'ar' || language === 'ur') && "transform scale-x-[-1]")} />
          <span className="sr-only">{t('buttons.back')}</span>
        </Button>
        <div className="flex items-center gap-2">
           <User className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-heading font-bold">{t('profilePage.title')}</h1>
        </div>
        <Button variant={isEditing ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={handleEditToggle}>
            {isEditing ? <Save className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
            <span className="sr-only">{isEditing ? t('buttons.saveProfile') : t('buttons.editProfile')}</span>
         </Button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 pb-20 space-y-6">
        <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                {/* Profile Header Section */}
                <section className="flex flex-col items-center space-y-4">
                    <div className="relative">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={profileForm.watch('profilePictureUrl') || userData.profilePictureUrl} alt={userData.username} data-ai-hint="handsome young man cartoon" />
                            <AvatarFallback><User className="h-12 w-12" /></AvatarFallback>
                        </Avatar>
                        {isEditing && (
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background border-primary text-primary hover:bg-primary/10"
                                onClick={handleImageEdit}
                            >
                                <Camera className="h-4 w-4" />
                                <span className="sr-only">{t('profilePage.editImage')}</span>
                            </Button>
                        )}
                         {/* Hidden field for profile picture URL if needed for form submission */}
                         <FormField
                           control={profileForm.control}
                           name="profilePictureUrl"
                           render={({ field }) => <input type="hidden" {...field} />}
                         />
                    </div>
                    {!isEditing ? (
                        <div className="text-center">
                            <h2 className="text-xl font-heading font-semibold">{language === 'ar' ? userData.fullName : 'Mahmoud Al-Hassani'}</h2>
                            <p className="text-muted-foreground">{userData.username}</p>
                        </div>
                    ) : (
                         <div className="w-full space-y-2 text-center">
                             {/* Username Input */}
                             <FormField
                                control={profileForm.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem className="text-left">
                                         <FormLabel>{t('profilePage.fullNameLabel')}</FormLabel>
                                         <FormControl>
                                            <Input {...field} className="input-base text-center text-lg font-semibold" />
                                         </FormControl>
                                         <FormMessage />
                                    </FormItem>
                                )}
                              />
                              {/* Username Input */}
                             <FormField
                                control={profileForm.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem className="text-left">
                                         <FormLabel>{t('profilePage.usernameLabel')}</FormLabel>
                                         <FormControl>
                                            <Input {...field} className="input-base text-center text-muted-foreground" placeholder="@username" />
                                         </FormControl>
                                         <FormMessage />
                                    </FormItem>
                                )}
                              />
                         </div>
                    )}
                </section>

                <Separator />

                {/* Profile Details Section */}
                 <section className="space-y-4">
                    {/* Email */}
                     <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('profilePage.emailLabel')}</FormLabel>
                                <FormControl>
                                    <Input type="email" {...field} readOnly={!isEditing} className={`input-base ${!isEditing ? 'bg-muted border-none' : ''}`} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                     {/* Description */}
                     <FormField
                        control={profileForm.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('profilePage.aboutMeLabel')}</FormLabel>
                                <FormControl>
                                    <Textarea
                                       {...field}
                                       readOnly={!isEditing}
                                       className={`input-base min-h-[60px] ${!isEditing ? 'bg-muted border-none' : ''}`}
                                       placeholder={!isEditing && !field.value ? t('profilePage.noDescription') : t('profilePage.aboutMePlaceholder')}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                 </section>


                {/* Save Button (Only visible when editing) */}
                {isEditing && (
                    <Button type="submit" className="w-full btn-base">
                        <Save className="mr-2 h-5 w-5" /> {t('buttons.saveChanges')}
                    </Button>
                )}
            </form>
        </Form>

        {/* Change Password Button & Dialog */}
        {!isEditing && (
            <>
            <Separator />
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full btn-base">
                        <KeyRound className="mr-2 h-5 w-5" /> {t('buttons.changePassword')}
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{t('profilePage.changePasswordDialogTitle')}</DialogTitle>
                        <DialogDescription>
                            {t('profilePage.changePasswordDialogDesc')}
                        </DialogDescription>
                    </DialogHeader>
                     <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 py-4">
                             <FormField
                                control={passwordForm.control}
                                name="currentPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('profilePage.currentPasswordLabel')}</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} className="input-base" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={passwordForm.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('profilePage.newPasswordLabel')}</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} className="input-base" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={passwordForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('profilePage.confirmNewPasswordLabel')}</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} className="input-base" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <DialogFooter>
                                {/* Add a hidden close button for programmatic closing */}
                                <DialogClose asChild>
                                    <Button id="changePasswordDialogClose" variant="ghost" className="hidden">{t('buttons.cancel')}</Button>
                                </DialogClose>
                                <DialogClose asChild>
                                     <Button type="button" variant="outline">{t('buttons.cancel')}</Button>
                                </DialogClose>
                                <Button type="submit">{t('buttons.savePassword')}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
           </>
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
        <Link href="/notifications" className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary pt-2 pb-1">
           <div className="relative">
             <Bell className="h-6 w-6" />
             {/* Example Notification Dot (optional) */}
              {/* <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-background bg-destructive"></span> */}
           </div>
          <span className="text-xs mt-1">{t('dashboard.notifications')}</span>
        </Link>
         <Link href="/profile" className="flex flex-col items-center justify-center text-primary pt-2 pb-1"> {/* Active State */}
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">{t('dashboard.profile')}</span>
        </Link>
      </nav>
    </div>
  );
}
