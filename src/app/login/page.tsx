
'use client';

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Facebook, Mail } from 'lucide-react';

import AppLogo from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext'; // Import useLanguage

// Define Zod schema for login form validation
const loginSchema = z.object({
  identifier: z.string().min(1, { message: 'Please enter your username or email.' }), // Message will be localized if needed
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  rememberMe: z.boolean().default(false).optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { toast } = useToast();
  const { t } = useLanguage(); // Use language context

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
      rememberMe: false,
    },
  });

  function onSubmit(values: LoginFormValues) {
    console.log('Login submitted:', values);
    
    toast({
        title: t('login.loginSuccessTitle', {defaultValue: "Login Successful"}), // DefaultValue for fallback
        description: t('login.loginSuccessDesc', {defaultValue: "Redirecting to dashboard..."}),
    });

    try {
        localStorage.setItem('onboardingCompleted', 'true');
    } catch (error) {
        console.error("Failed to set onboarding flag in localStorage:", error);
    }

    setTimeout(() => {
        window.location.href = '/dashboard';
    }, 1500);
  }

  function handleSocialLogin(provider: 'google' | 'facebook') {
      console.log(`Login with ${provider}`);
       toast({
           title: t('login.socialLoginTitle', {defaultValue: "Social Login"}),
           description: t('login.socialLoginDescNotImplemented', { provider: provider, defaultValue: `${provider} login functionality not implemented yet.` }),
           variant: "destructive",
       });
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-background">
      <Card className="w-full max-w-md card-base">
        <CardHeader className="text-center">
           <div className="mx-auto mb-4">
             <AppLogo className="h-12 w-12 text-primary" />
           </div>
          <CardTitle className="text-2xl font-heading">{t('login.title')}</CardTitle>
          <CardDescription>{t('login.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('login.usernameOrEmailLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('login.usernameOrEmailPlaceholder')} {...field} className="input-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('login.passwordLabel')}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={t('login.passwordPlaceholder')} {...field} className="input-base" />
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-between text-sm">
                 <FormField
                   control={form.control}
                   name="rememberMe"
                   render={({ field }) => (
                     <FormItem className="flex items-center space-x-2 rtl:space-x-reverse space-y-0">
                       <FormControl>
                         <Checkbox
                           checked={field.value}
                           onCheckedChange={field.onChange}
                           id="rememberMe"
                         />
                       </FormControl>
                       <FormLabel htmlFor="rememberMe" className="font-normal leading-none">{t('login.rememberMe')}</FormLabel>
                     </FormItem>
                   )}
                 />
                <Link href="/forgot-password" className="text-primary hover:underline">
                  {t('login.forgotPassword')}
                </Link>
              </div>
              <Button type="submit" className="w-full btn-base">{t('buttons.login')}</Button>
            </form>
          </Form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                {t('login.orContinueWith')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="btn-base" onClick={() => handleSocialLogin('google')}>
              <svg className="rtl:ml-2 ltr:mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l0.001-0.001l6.19,5.238C39.601,36.943,44,31.016,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
               {t('login.google')}
            </Button>
            <Button variant="outline" className="btn-base" onClick={() => handleSocialLogin('facebook')}>
               <Facebook className="rtl:ml-2 ltr:mr-2 h-4 w-4" /> {t('login.facebook')}
            </Button>
          </div>
        </CardContent>
         <CardFooter className="justify-center text-sm">
           <p className="text-muted-foreground">
             {t('login.noAccount')}{' '}
             <Link href="/signup" className="font-medium text-primary hover:underline">
               {t('login.signUpLink')}
             </Link>
           </p>
         </CardFooter>
      </Card>
    </div>
  );
}
