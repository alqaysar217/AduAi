
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Search,
  Languages as LanguagesIcon,
  MoreVertical,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useLanguage, type Language as AppLanguage } from '@/contexts/LanguageContext';

interface LanguageOption {
  code: AppLanguage;
  nameKey: string; // Key for translation
  nativeName: string; // Name in its own language for display
  flagPlaceholder: string; // Emoji flag or similar
}

const availableLanguages: LanguageOption[] = [
  { code: 'en', nameKey: 'languageSettingsPage.english', nativeName: 'English', flagPlaceholder: '🇬🇧' },
  { code: 'ar', nameKey: 'languageSettingsPage.arabic', nativeName: 'العربية', flagPlaceholder: '🇸🇦' },
  { code: 'pt', nameKey: 'languageSettingsPage.portuguese', nativeName: 'Português', flagPlaceholder: '🇵🇹' },
  { code: 'fr', nameKey: 'languageSettingsPage.french', nativeName: 'Français', flagPlaceholder: '🇫🇷' },
  { code: 'de', nameKey: 'languageSettingsPage.german', nativeName: 'Deutsch', flagPlaceholder: '🇩🇪' },
  { code: 'es', nameKey: 'languageSettingsPage.spanish', nativeName: 'Español', flagPlaceholder: '🇪🇸' },
  { code: 'ja', nameKey: 'languageSettingsPage.japanese', nativeName: '日本語', flagPlaceholder: '🇯🇵' },
  { code: 'ru', nameKey: 'languageSettingsPage.russian', nativeName: 'Русский', flagPlaceholder: '🇷🇺' },
  { code: 'hi', nameKey: 'languageSettingsPage.hindi', nativeName: 'हिन्दी', flagPlaceholder: '🇮🇳' },
  { code: 'zh', nameKey: 'languageSettingsPage.chinese_simplified', nativeName: '简体中文', flagPlaceholder: '🇨🇳' },
  { code: 'tr', nameKey: 'languageSettingsPage.turkish', nativeName: 'Türkçe', flagPlaceholder: '🇹🇷' },
  { code: 'it', nameKey: 'languageSettingsPage.italian', nativeName: 'Italiano', flagPlaceholder: '🇮🇹' },
  { code: 'ko', nameKey: 'languageSettingsPage.korean', nativeName: '한국어', flagPlaceholder: '🇰🇷' },
  { code: 'id', nameKey: 'languageSettingsPage.indonesian', nativeName: 'Bahasa Indonesia', flagPlaceholder: '🇮🇩' },
  { code: 'ur', nameKey: 'languageSettingsPage.urdu', nativeName: 'اردو', flagPlaceholder: '🇵🇰' },
];

export default function LanguageSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleLanguageSelect = (value: string) => {
    const newLang = value as AppLanguage;
    setLanguage(newLang);
    const selectedLangObj = availableLanguages.find(lang => lang.code === newLang);
    toast({
      title: t('languageSettingsPage.languageChanged'),
      description: t('languageSettingsPage.languageChangedDesc', { language: selectedLangObj?.nativeName || newLang }),
    });
  };

  const filteredLanguages = useMemo(() => {
    if (!searchTerm) {
      return availableLanguages;
    }
    return availableLanguages.filter(langOpt =>
      t(langOpt.nameKey, {defaultValue: langOpt.nativeName}).toLowerCase().includes(searchTerm.toLowerCase()) || // Search translated name
      langOpt.nativeName.toLowerCase().includes(searchTerm.toLowerCase()) // Search native name
    );
  }, [searchTerm, t, availableLanguages]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-background border-b">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft className={cn("h-5 w-5", (language === 'ar' || language === 'ur') && "transform scale-x-[-1]")} />
          <span className="sr-only">{t('buttons.back')}</span>
        </Button>
        <div className="flex items-center gap-2">
           <LanguagesIcon className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-heading font-bold">{t('languageSettingsPage.title')}</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-5 w-5" />
              <span className="sr-only">{t('buttons.options')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
             <DropdownMenuItem onClick={() => toast({ title: t('buttons.help') + " (Not implemented)" })}>{t('buttons.help')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <div className="relative">
          <Search className="absolute rtl:right-3 ltr:left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('languageSettingsPage.searchPlaceholder')}
            className="w-full rtl:pr-10 ltr:pl-10 input-base"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <Card className="card-base">
          <CardHeader>
              <CardTitle className="text-base font-heading">{t('languageSettingsPage.selectAppLanguage')}</CardTitle>
              <CardDescription>{t('languageSettingsPage.selectAppLanguageDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-18rem)] md:h-96"> {/* Adjust height for better scrollability */}
                  <RadioGroup value={language} onValueChange={handleLanguageSelect} className="p-4 space-y-1">
                      {filteredLanguages.length > 0 ? (
                          filteredLanguages.map(langOpt => (
                            <Label
                              key={langOpt.code}
                              htmlFor={`lang-${langOpt.code}`}
                              className={cn(
                                "flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors hover:bg-muted/50",
                                language === langOpt.code && "bg-primary/10 border border-primary"
                              )}
                            >
                               <div className="flex items-center gap-3">
                                    <span className="text-xl" role="img" aria-label={`${langOpt.nativeName} flag`}>
                                      {langOpt.flagPlaceholder}
                                    </span>
                                    <span className="text-sm font-medium">{langOpt.nativeName} ({t(langOpt.nameKey, {defaultValue: langOpt.nativeName})})</span>
                               </div>
                               <RadioGroupItem value={langOpt.code} id={`lang-${langOpt.code}`} className="h-5 w-5" />
                            </Label>
                          ))
                      ) : (
                          <p className="text-center text-muted-foreground py-6">{t('languageSettingsPage.noLanguagesFound', { searchTerm: searchTerm })}</p>
                      )}
                  </RadioGroup>
              </ScrollArea>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
