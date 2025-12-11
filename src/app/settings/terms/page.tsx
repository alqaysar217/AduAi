
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, MoreVertical } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

// Updated Terms Content
const termsContent = `
# EduAI Terms of Service
**Last Updated: May 11, 2025**

Welcome to EduAI! These Terms of Service ("Terms") govern your use of the EduAI mobile application and related services (collectively, the "Service") provided by EduAI Team ("we", "us", or "our"). By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use the Service.

## 1. Account Registration
To access certain features of EduAI, you may be required to register an account. You agree to provide accurate, current, and complete information during registration and to update it as needed. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.

## 2. Use of the Service
You agree to use EduAI only for lawful educational and academic purposes. You agree not to use the Service to:
- Violate any local, national, or international laws.
- Distribute unsolicited advertisements or spam.
- Upload harmful, abusive, or offensive content.
- Impersonate any person or entity, including EduAI staff.
- Attempt to reverse-engineer, tamper with, or exploit the Service.

## 3. Intellectual Property
All content, features, and functionality of EduAI (except content submitted by users) are the exclusive property of EduAI Team and are protected by copyright, trademark, and other applicable laws.

## 4. User Content
You retain ownership of any content you submit through EduAI. However, by submitting content, you grant us a non-exclusive, royalty-free license to use, display, and improve the Service based on your content, in compliance with our Privacy Policy.

## 5. Termination
We may suspend or terminate your access to the Service at any time, without notice, if we believe you have violated these Terms.

## 6. Disclaimer
The Service is provided "AS IS" and "AS AVAILABLE". We make no guarantees regarding accuracy, performance, or uninterrupted access.

## 7. Limitation of Liability
To the fullest extent permitted by law, EduAI Team shall not be liable for any damages resulting from the use or inability to use the Service.

## 8. Governing Law
These Terms are governed by and interpreted in accordance with the laws of the Republic of Yemen, without regard to its conflict of law provisions.

## 9. Changes to Terms
We may modify these Terms from time to time. Continued use of EduAI after changes are posted constitutes your acceptance of the revised Terms.

## 10. Contact Us
If you have any questions about these Terms, please contact us at: **eduai.support@gmail.com**
`;


export default function TermsOfServicePage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleAccept = () => {
      toast({ title: "Terms Accepted", description: "You have accepted the Terms of Service." });
      // Optionally store acceptance state
      router.back(); // Go back after accepting
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
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-heading font-bold">Terms of Service</h1>
        </div>
         <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-5 w-5" />
              <span className="sr-only">Options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => toast({ title: "Print clicked (Not implemented)" })}>Print</DropdownMenuItem>
             <DropdownMenuItem onClick={() => toast({ title: "Help clicked" })}>Help</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 flex flex-col">
          <Card className="card-base flex-1 flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-heading">EduAI Terms of Service</CardTitle>
              <CardDescription>Please read our terms carefully before using the app.</CardDescription>
            </CardHeader>
             <CardContent className="flex-1 overflow-hidden p-0">
                  <ScrollArea className="h-full p-6">
                      {/* Using <pre> to preserve formatting similar to markdown */}
                      <pre className="whitespace-pre-wrap font-body text-sm leading-relaxed text-foreground">
                          {termsContent}
                      </pre>
                  </ScrollArea>
             </CardContent>
            <CardFooter className="border-t p-4 flex justify-end">
                <Button onClick={handleAccept} className="btn-base">
                   Accept & Continue
                </Button>
            </CardFooter>
          </Card>
      </main>
    </div>
  );
}

