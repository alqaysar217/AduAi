
'use client';

import type { ReactNode } from 'react';
import React, { useState, useEffect, useCallback } from 'react';
import LanguageContext, { type Language } from '@/contexts/LanguageContext';

interface LanguageProviderProps {
  children: ReactNode;
}

const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState<Language>('en'); // Default to English
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedLanguage = localStorage.getItem('eduai-lang') as Language | null;
    const validLanguages: Language[] = ['en', 'ar', 'pt', 'fr', 'de', 'es', 'ja', 'ru', 'hi', 'zh', 'tr', 'it', 'ko', 'id', 'ur'];
    if (storedLanguage && validLanguages.includes(storedLanguage)) {
      setLanguage(storedLanguage);
    } else {
      // If no stored language, or invalid, set default and store it
      localStorage.setItem('eduai-lang', 'en'); // Default to English
      setLanguage('en'); // Explicitly set default
    }
  }, []);

  useEffect(() => {
    const loadTranslations = async () => {
      setIsLoading(true);
      try {
        const localeData = await import(`@/locales/${language}.json`);
        setTranslations(localeData.default || localeData);
      } catch (error) {
        console.error(`Could not load translations for ${language}:`, error);
        // Fallback to English if selected language fails, then Arabic
        if (language !== 'en') { 
            try {
                const fallbackData = await import(`@/locales/en.json`);
                setTranslations(fallbackData.default || fallbackData);
                 console.warn(`Fell back to English for ${language}`);
            } catch (fallbackError) {
                console.error(`Could not load fallback translations for en:`, fallbackError);
                 try {
                    const arabicFallback = await import(`@/locales/ar.json`);
                    setTranslations(arabicFallback.default || arabicFallback);
                    console.warn(`Fell back to Arabic for ${language}`);
                } catch (arabicError) {
                    console.error(`Could not load fallback translations for ar:`, arabicError);
                    setTranslations({});
                }
            }
        } else { // if english fails, try arabic
             try {
                const fallbackData = await import(`@/locales/ar.json`);
                setTranslations(fallbackData.default || fallbackData);
                console.warn(`Fell back to Arabic because English failed`);
            } catch (fallbackError) {
                console.error(`Could not load fallback translations for ar:`, fallbackError);
                setTranslations({});
            }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [language]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' || language === 'ur' ? 'rtl' : 'ltr'; // Add Urdu to RTL
      localStorage.setItem('eduai-lang', language);

      // Update CSS variables for fonts
      if (language === 'ar' || language === 'ur') { // Add Urdu to Tajawal font users
        document.documentElement.style.setProperty('--font-active-body', 'var(--font-roboto)');
        document.documentElement.style.setProperty('--font-active-heading', 'var(--font-tajawal)');
      } else { // 'en' or other LTR languages
        document.documentElement.style.setProperty('--font-active-body', 'var(--font-roboto)');
        document.documentElement.style.setProperty('--font-active-heading', 'var(--font-roboto)');
      }
    }
  }, [language]);

  const t = useCallback((key: string, replacements?: Record<string, string | number>): string => {
    if (isLoading && Object.keys(translations).length === 0) return key; 

    let translation = key.split('.').reduce((obj, k) => obj && obj[k], translations);

    if (typeof translation === 'string' && replacements) {
      Object.keys(replacements).forEach(placeholder => {
        const value = replacements[placeholder];
        translation = translation.replace(new RegExp(`{{${placeholder}}}`, 'g'), String(value));
      });
    }
    
    if (typeof translation !== 'string' && replacements?.defaultValue) {
        return String(replacements.defaultValue);
    }
    
    return typeof translation === 'string' ? translation : key; 
  }, [translations, isLoading]);


  if (isLoading && Object.keys(translations).length === 0) {
    // Optional: Render a global loading state
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
