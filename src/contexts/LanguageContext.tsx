
'use client';

import type { Dispatch, ReactNode, SetStateAction } from 'react';
import React, { createContext, useContext } from 'react';

export type Language =
  | 'en'
  | 'ar'
  | 'pt'
  | 'fr'
  | 'de'
  | 'es'
  | 'ja'
  | 'ru'
  | 'hi'
  | 'zh'
  | 'tr'
  | 'it'
  | 'ko'
  | 'id'
  | 'ur';

interface LanguageContextType {
  language: Language;
  setLanguage: Dispatch<SetStateAction<Language>>;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  translations: Record<string, any>; // Consider a more specific type if your translation structure is fixed
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
