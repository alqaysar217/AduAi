
import type { Metadata } from "next";
import { Roboto, Tajawal } from "next/font/google"; // Import Tajawal
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import ThemeInitializer from "@/components/theme-initializer";
import LanguageProvider from "@/providers/LanguageProvider"; // Import LanguageProvider

const roboto = Roboto({
  weight: ["400", "700"],
  subsets: ["latin", "arabic"], // Add Arabic subset if needed for Roboto
  variable: "--font-roboto",
});

const tajawal = Tajawal({ // Define Tajawal font
  weight: ["400", "700"],
  subsets: ["arabic"],
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  title: "EduAI",
  description: "AI-Powered Educational Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // LanguageProvider will set lang and dir on <html>
    // ThemeInitializer handles initial theme before hydration
    // No whitespace between <html...> and <head>
    <LanguageProvider>
      <html lang="en" suppressHydrationWarning><head><ThemeInitializer /></head>
        <body
          className={cn(
            "min-h-screen bg-background text-foreground font-body antialiased",
            roboto.variable, // Make Roboto variable available
            tajawal.variable  // Make Tajawal variable available
          )}
        >
          {children}
          <Toaster />
        </body>
      </html>
    </LanguageProvider>
  );
}
