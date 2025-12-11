
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLogo from "@/components/app-logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const SPLASH_DURATION = 3000; // 3 seconds

export default function LaunchScreen() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [navigationTarget, setNavigationTarget] = useState<string | null>(null);

  useEffect(() => {
    const intervalTime = SPLASH_DURATION / 100; 

    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + 1;
        if (newProgress >= 100) {
          clearInterval(timer);
          // Always navigate to welcome screen 1 after splash
          setNavigationTarget('/welcome/1');
          return 100; 
        }
        return newProgress; 
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []); 

  useEffect(() => {
    if (navigationTarget) {
      router.replace(navigationTarget);
    }
  }, [navigationTarget, router]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-background">
      <Card className="w-full max-w-sm text-center card-base border-none shadow-none bg-transparent">
        <CardHeader className="border-none pb-4">
           <div className="mx-auto mb-4">
             <AppLogo className="h-20 w-20 text-primary" /> {/* Increased logo size */}
           </div>
          <CardTitle className="text-3xl font-heading">EduAI</CardTitle> {/* App Name */}
        </CardHeader>
        <CardContent className="border-none pt-0">
          <CardDescription className="mb-6">
             AI-Powered Educational Platform {/* Tagline */}
          </CardDescription>
          {/* Progress Bar */}
          <Progress value={progress} className="w-full h-2 rounded-full" />
           <p className="mt-2 text-xs text-muted-foreground">
             Loading... {progress}%
           </p>
        </CardContent>
      </Card>
    </div>
  );
}
