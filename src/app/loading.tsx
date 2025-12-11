
'use client'; // Keep as client component for potential future animations

import AppLogo from "@/components/app-logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton"; // Use Skeleton for a more generic loading indicator

export default function Loading() {
  // This loading screen is used by Next.js for initial route transitions.
  // The primary splash screen is handled by /launch/page.tsx
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-background">
      <Card className="w-full max-w-sm text-center card-base border-none shadow-none bg-transparent">
        <CardHeader className="border-none">
           <div className="mx-auto mb-4">
             <AppLogo className="h-16 w-16 text-primary animate-pulse" />
           </div>
          <CardTitle className="text-3xl font-heading">EduAI</CardTitle> {/* Changed name */}
        </CardHeader>
        <CardContent className="border-none">
           {/* Simple loading indicator */}
           <Skeleton className="h-4 w-3/4 mx-auto bg-muted" />
           <p className="mt-4 text-sm text-muted-foreground">
             Loading...
           </p>
        </CardContent>
      </Card>
    </div>
  );
}
