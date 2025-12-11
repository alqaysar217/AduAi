
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Search,
  Heart, // Icon for Favorites page and toggle
  Home,
  Bell,
  User,
  Mic,
  Clapperboard,
  Languages,
  BookOpenCheck,
  Code,
  Palette,
  // Add other tool icons as needed
} from 'lucide-react';

import AppLogo from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext'; // Added
import { cn } from '@/lib/utils'; // Added

// Define Tool type (ensure consistency with other pages)
interface Tool {
  id: string; // Add unique ID for key prop and removal logic
  icon: React.ElementType;
  name: string;
  category: string; // Renamed from 'field' for consistency
  description: string;
  path: string; // Link path for the tool
}

// Mock data for favorite tools (replace with actual data fetching later)
const initialFavoriteTools: Tool[] = [
  {
    id: 'tool-1',
    icon: Mic,
    name: 'Podcast Generator',
    category: 'Audio',
    description: 'Create podcasts from text.',
    path: '/tools/podcast-generator',
  },
  {
    id: 'tool-3',
    icon: Languages,
    name: 'Smart Translation',
    category: 'Translation',
    description: 'Translate text with high accuracy.',
    path: '/tools/smart-translation',
  },
  {
    id: 'tool-5',
    icon: Code,
    name: 'Code Assistant',
    category: 'Programming',
    description: 'Generate, debug, and explain code.',
    path: '/tools/code-assistant',
  },
    {
    id: 'tool-2',
    icon: Clapperboard,
    name: 'Video Summarizer',
    category: 'Summarization',
    description: 'Summarize long videos quickly.',
    path: '/tools/video-summarizer',
  },
];

export default function FavoritesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { language, t } = useLanguage(); // Added
  const [searchTerm, setSearchTerm] = useState('');
  const [favoriteTools, setFavoriteTools] = useState<Tool[]>(initialFavoriteTools);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleRemoveFavorite = (toolId: string, toolName: string) => {
    setFavoriteTools(prevFavorites => prevFavorites.filter(tool => tool.id !== toolId));
    toast({
      titleKey: "favoritesPage.toolRemoved",
      descriptionKey: "favoritesPage.toolRemovedDesc",
      titleReplacements: { toolName: toolName },
      descriptionReplacements: { toolName: toolName }
    });
  };

  const handleToolClick = (toolName: string) => {
    // Navigate to the tool page or show a toast if not implemented
     toast({
       title: toolName,
       descriptionKey: "dashboard.toolNotImplemented", // Use existing key if appropriate
     });
     // Example navigation: router.push(toolPath);
   };

  const filteredTools = useMemo(() => {
    if (!searchTerm) {
      return favoriteTools;
    }
    return favoriteTools.filter(tool =>
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, favoriteTools]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-background border-b">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft className={cn("h-5 w-5", (language === 'ar' || language === 'ur') && "transform scale-x-[-1]")} />
          <span className="sr-only">{t('buttons.back')}</span>
        </Button>

        {/* Page Title and Icon */}
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary" />
          <span className="font-heading text-lg font-bold">{t('favoritesPage.title')}</span>
        </div>

        {/* Placeholder for alignment */}
        <div className="w-8"></div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 pb-20"> {/* Add padding-bottom for nav */}
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute rtl:right-3 ltr:left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('favoritesPage.searchPlaceholder')}
            className="w-full rtl:pr-10 ltr:pl-10 input-base"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {/* Favorites List */}
        {favoriteTools.length === 0 ? (
          <div className="text-center text-muted-foreground mt-10">
             <Heart className="mx-auto h-12 w-12 mb-4" />
             <p>{t('favoritesPage.noFavorites')}</p>
             <Button variant="link" className="mt-2 text-primary" asChild>
               <Link href="/tools">{t('favoritesPage.exploreTools')}</Link>
             </Button>
          </div>
        ) : filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredTools.map(tool => (
              <Card
                key={tool.id}
                className="card-base transition-shadow cursor-pointer relative group/card" // Add relative and group
                 onClick={() => handleToolClick(tool.name)} // Handle click on card itself
              >
                <CardHeader className="flex flex-row items-start gap-4 pb-2 pr-10"> {/* Add padding-right for button */}
                  <tool.icon className="h-8 w-8 text-primary mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <CardTitle className="text-lg font-heading">{tool.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1 text-xs">{t(`toolCategories.${tool.category.toLowerCase()}`, {defaultValue: tool.category})}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pr-10"> {/* Add padding-right for button */}
                  <p className="text-sm text-muted-foreground line-clamp-2">{tool.description}</p>
                </CardContent>
                 {/* Favorite Toggle Button */}
                 <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click handler
                      handleRemoveFavorite(tool.id, tool.name);
                    }}
                    aria-label={`Remove ${tool.name} from favorites`}
                  >
                    <Heart className="h-5 w-5 fill-current" /> {/* Filled heart */}
                 </Button>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center col-span-full mt-10">{t('tools.noToolsFound')}</p> // Reusing existing key
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-10 flex justify-around h-16 bg-background border-t">
        <Link href="/dashboard" className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary pt-2 pb-1">
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">{t('dashboard.home')}</span>
        </Link>
         <Link href="/favorites" className="flex flex-col items-center justify-center text-primary pt-2 pb-1"> {/* Active State */}
          <Heart className="h-6 w-6" />
          <span className="text-xs mt-1">{t('dashboard.favorites')}</span>
        </Link>
        <Link href="/notifications" className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary pt-2 pb-1"> {/* Updated href */}
           <div className="relative">
             <Bell className="h-6 w-6" />
             {/* Example Notification Dot (optional) */}
              {/* <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-background bg-destructive"></span> */}
           </div>
          <span className="text-xs mt-1">{t('dashboard.notifications')}</span>
        </Link>
         <Link href="/profile" className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary pt-2 pb-1"> {/* Updated href */}
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">{t('dashboard.profile')}</span>
        </Link>
      </nav>
    </div>
  );
}
