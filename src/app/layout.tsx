import type { Metadata } from "next";
import { Roboto, Tajawal } from "next/font/google"; 
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import ThemeInitializer from "@/components/theme-initializer";
import LanguageProvider from "@/providers/LanguageProvider";

const roboto = Roboto({
  weight: ["400", "700"],
  subsets: ["latin"], // ⬅️ تم حذف "arabic" من هنا
  variable: "--font-roboto",
});

const tajawal = Tajawal({ 
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
    <LanguageProvider>
      {/* تأكد من أن LanguageProvider أو إعدادات CSS لديك تستخدم Tajawal كخط أساسي عند الحاجة للعربية */}
      <html lang="en" suppressHydrationWarning><head><ThemeInitializer /></head>
        <body
          className={cn(
            "min-h-screen bg-background text-foreground font-body antialiased",
            roboto.variable,
            tajawal.variable 
          )}
        >
          {children}
          <Toaster />
        </body>
      </html>
    </LanguageProvider>
  );
}