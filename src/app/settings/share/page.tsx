
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Share2, MoreVertical, Copy, MessageSquare, Mail } from 'lucide-react'; // Assuming MessageSquare for WhatsApp, Mail for Email

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'; // Added CardFooter
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Define share message and link
const shareLink = typeof window !== 'undefined' ? window.location.origin : 'https://eduai.app'; // Get base URL or use a placeholder
const shareMessage = `Check out EduAI, the AI-powered learning platform! ${shareLink}`;

// Placeholder icons for social media (replace with actual if available)
const FacebookIcon = () => <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.67 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C18.34 21.21 22 17.06 22 12.06C22 6.53 17.5 2.04 12 2.04Z" /></svg>;
const TwitterIcon = () => <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.46.67.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" /></svg>;


export default function ShareAppPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink)
      .then(() => toast({ title: 'Link Copied!', description: 'You can now paste the link.' }))
      .catch(err => toast({ title: 'Copy Failed', description: 'Could not copy the link.', variant: 'destructive' }));
  };

  const handleSocialShare = (platform: string) => {
      let url = '';
      const encodedMessage = encodeURIComponent(shareMessage);
      const encodedLink = encodeURIComponent(shareLink);

      switch (platform) {
        case 'facebook':
          url = `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`;
          break;
        case 'twitter':
          url = `https://twitter.com/intent/tweet?text=${encodedMessage}`;
          break;
        case 'whatsapp':
          url = `https://wa.me/?text=${encodedMessage}`;
          break;
        case 'email':
           url = `mailto:?subject=${encodeURIComponent("Check out EduAI!")}&body=${encodedMessage}`;
           break;
        default:
          toast({ title: 'Sharing Error', description: 'Unknown platform.', variant: 'destructive' });
          return;
      }

      // Open the share URL in a new tab/window
       if (url) {
           window.open(url, '_blank', 'noopener,noreferrer');
           toast({ title: `Sharing on ${platform}` });
       }
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
          <Share2 className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-heading font-bold">Share EduAI</h1>
        </div>
         <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-5 w-5" />
              <span className="sr-only">Options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
             <DropdownMenuItem onClick={() => toast({ title: "Help clicked" })}>Help</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 flex flex-col items-center justify-center">
        <Card className="card-base w-full max-w-md text-center">
            <CardHeader className="pb-4">
                 <Share2 className="h-16 w-16 text-primary mx-auto mb-4" />
                <CardTitle className="text-2xl font-heading">Share the Knowledge!</CardTitle>
                <CardDescription>Invite your friends and colleagues to join EduAI.</CardDescription>
            </CardHeader>
             <CardContent className="space-y-6">
                {/* Share Link Section */}
                <div className="space-y-2">
                    <Label htmlFor="share-link-input">App Link</Label>
                    <div className="flex items-center space-x-2">
                        <Input
                            id="share-link-input"
                            type="text"
                            value={shareLink}
                            readOnly
                            className="input-base flex-1"
                        />
                        <Button type="button" size="icon" onClick={handleCopyLink} aria-label="Copy link">
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                 <Separator />

                 {/* Social Share Buttons */}
                  <div>
                      <Label className="block mb-3 text-center text-muted-foreground">Share via:</Label>
                      <div className="flex justify-center gap-4">
                          {/* WhatsApp */}
                          <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-green-500 text-green-500 hover:bg-green-50" onClick={() => handleSocialShare('whatsapp')} aria-label="Share on WhatsApp">
                              <MessageSquare className="h-6 w-6"/>
                          </Button>
                          {/* Email */}
                          <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-red-500 text-red-500 hover:bg-red-50" onClick={() => handleSocialShare('email')} aria-label="Share via Email">
                               <Mail className="h-6 w-6"/>
                          </Button>
                           {/* Facebook */}
                          <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-blue-600 text-blue-600 hover:bg-blue-50" onClick={() => handleSocialShare('facebook')} aria-label="Share on Facebook">
                                <FacebookIcon />
                          </Button>
                           {/* Twitter */}
                           <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-sky-500 text-sky-500 hover:bg-sky-50" onClick={() => handleSocialShare('twitter')} aria-label="Share on Twitter">
                                <TwitterIcon />
                            </Button>
                      </div>
                  </div>
             </CardContent>
             {/* No CardFooter needed for this page */}
        </Card>
      </main>
    </div>
  );
}
