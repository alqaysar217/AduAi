'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck, MoreVertical } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'; // Added CardFooter
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

// Updated Privacy Policy Content
const privacyPolicyContent = `
# EduAI Privacy Policy
**Last Updated: May 11, 2025**

This Privacy Policy describes how **EduAI** ("we", "us", or "our") collects, uses, and protects the information you provide when using our mobile application and related services ("the Service"). By using EduAI, you agree to the collection and use of information in accordance with this policy.

## 1. Information We Collect

We collect the following types of data to provide and improve the Service:

- **Personal Data**: Such as your name, email address, and login method (Google, Facebook).
- **Usage Data**: Includes device type, IP address, language, interactions with tools, and session duration.
- **User Content**: Any text, files, or inputs you provide or generate through the app’s tools (e.g., summaries, translations, AI content).

## 2. How We Use Your Data

We use your data to:
- Operate and maintain the EduAI platform.
- Personalize your experience and provide tool recommendations.
- Improve performance and introduce new features.
- Provide support and respond to inquiries.
- Monitor app usage and fix issues.
- Notify you of updates or changes.

## 3. Data Security

Your data is stored securely on servers managed by trusted providers such as **Google Cloud or Firebase**.
We use standard encryption and access controls, but no system is 100% secure. We take reasonable steps to protect your data.

## 4. Data Sharing and Disclosure

We do **not sell** your personal data.
We may share your data only in the following cases:
- With third-party service providers to support platform functionality.
- If required by law or legal process.
- With your consent, when connecting to services like Google or Facebook.

## 5. Your Rights

Depending on your location, you may have the right to:
- Access or update your data.
- Request deletion of your data.
- Withdraw consent to data processing.
- Contact us for any data concerns.

## 6. Children’s Privacy

EduAI is intended for users aged **13 years and older**. We do not knowingly collect data from children under 13. If you believe your child has provided us personal data, please contact us.

## 7. Changes to This Policy

We may update this Privacy Policy to reflect changes in our app or legal obligations. Updates will be posted here with the date of the last change.

## 8. Contact Us

If you have questions or concerns about this Privacy Policy, please contact us at:
**eduai.support@gmail.com**
`;

export default function PrivacyPolicyPage() {
  const router = useRouter();
  const { toast } = useToast();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
       <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-background border-b">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Button>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-heading font-bold">Privacy Policy</h1>
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
                <CardTitle className="text-xl font-heading">EduAI Privacy Policy</CardTitle>
                <CardDescription>How we handle your data.</CardDescription>
            </CardHeader>
             <CardContent className="flex-1 overflow-hidden p-0">
                  <ScrollArea className="h-full p-6">
                      <pre className="whitespace-pre-wrap font-body text-sm leading-relaxed text-foreground">
                          {privacyPolicyContent}
                      </pre>
                  </ScrollArea>
             </CardContent>
             <CardFooter className="border-t p-4 flex justify-end">
                <Button onClick={() => router.back()} variant="outline" className="btn-base">
                   Close
                </Button>
            </CardFooter>
        </Card>
      </main>
    </div>
  );
}