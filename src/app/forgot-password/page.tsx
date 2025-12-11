'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import AppLogo from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast'; // Import useToast

// Define Zod schema for initial email request form validation
const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
});
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

// Define Zod schema for reset password form validation
const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string().min(6, { message: 'Please confirm your password.' }),
})
.refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // Path of error
});
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

type ForgotPasswordStep = 'request' | 'reset' | 'success';

export default function ForgotPasswordPage() {
    const { toast } = useToast(); // Initialize useToast
    const [step, setStep] = useState<ForgotPasswordStep>('request');
    const [emailForReset, setEmailForReset] = useState('');

    // Form for requesting the reset link
    const requestForm = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
          email: '',
        },
    });

    // Form for setting the new password
    const resetForm = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            newPassword: '',
            confirmPassword: '',
        },
    });

    function onRequestSubmit(values: ForgotPasswordFormValues) {
        // Handle forgot password logic here (e.g., API call to send reset link)
        console.log('Password reset requested for:', values.email);
        setEmailForReset(values.email); // Store email for the next step (optional)
        // Simulate sending link and move to the next step
        toast({
            title: "Reset Link Sent (Simulated)",
            description: `If an account exists for ${values.email}, a password reset link has been sent.`,
        });
        // In a real app, you'd wait for the user to click the link.
        // For this demo, we'll immediately go to the reset step.
        // You might need a token from the URL in a real scenario.
        setStep('reset');
    }

    function onResetSubmit(values: ResetPasswordFormValues) {
        // Handle password update logic here (e.g., API call)
        console.log('New password submitted:', values.newPassword);
        // Simulate successful password update
        toast({
            title: "Password Updated",
            description: "Your password has been successfully updated.",
        });
        setStep('success');
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-background">
            <Card className="w-full max-w-md card-base">
                {step === 'request' && (
                    <>
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4">
                                <AppLogo className="h-12 w-12 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-heading">Reset Password</CardTitle>
                            <CardDescription>Enter your email to receive reset instructions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...requestForm}>
                                <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} className="space-y-4">
                                    <FormField
                                        control={requestForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="you@example.com" {...field} className="input-base" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full btn-base">Send Password Reset Link</Button>
                                </form>
                            </Form>
                        </CardContent>
                        <CardFooter className="justify-center text-sm">
                            <Link href="/login" className="font-medium text-primary hover:underline">
                                Back to Login
                            </Link>
                        </CardFooter>
                    </>
                )}

                {step === 'reset' && (
                     <>
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4">
                                <AppLogo className="h-12 w-12 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-heading">Set New Password</CardTitle>
                            <CardDescription>Enter and confirm your new password below.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...resetForm}>
                                <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
                                    <FormField
                                        control={resetForm.control}
                                        name="newPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>New Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="••••••••" {...field} className="input-base" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={resetForm.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirm New Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="••••••••" {...field} className="input-base" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full btn-base">Save New Password</Button>
                                </form>
                            </Form>
                        </CardContent>
                    </>
                )}

                 {step === 'success' && (
                     <>
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 text-green-500">
                               {/* Success Icon Placeholder */}
                               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                            </div>
                            <CardTitle className="text-2xl font-heading">Password Updated!</CardTitle>
                            <CardDescription>Your password has been successfully reset.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                             <Button asChild className="w-full max-w-xs btn-base">
                                <Link href="/login">Return to Login</Link>
                             </Button>
                        </CardContent>
                    </>
                 )}
            </Card>
        </div>
    );
}
