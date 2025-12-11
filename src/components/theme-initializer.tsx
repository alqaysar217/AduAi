// src/components/theme-initializer.tsx
'use client';
import { useEffect } from 'react';

// This script will run on the client before the page is hydrated.
// It checks localStorage for a 'theme' preference and applies it.
// If no preference is found, it defaults to 'dark' theme.
// If 'system' is preferred, it respects the system's color scheme.

const script = `
(function() {
  try {
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const docEl = document.documentElement;

    if (storedTheme === 'light') {
      docEl.classList.remove('dark');
    } else if (storedTheme === 'dark') {
      docEl.classList.add('dark');
    } else if (storedTheme === 'system') {
      if (systemPrefersDark) {
        docEl.classList.add('dark');
      } else {
        docEl.classList.remove('dark');
      }
    } else {
      // Default to dark theme if no preference is stored
      docEl.classList.add('dark'); 
    }
  } catch (e) {
    // If localStorage or matchMedia is not available, do nothing
    console.error('Failed to apply initial theme:', e);
  }
})();
`;

// This component injects the script into the <head>
export default function ThemeInitializer() {
  useEffect(() => {
    // This effect runs after hydration, primarily for development or specific scenarios.
    // The core logic is in the IIFE script for pre-hydration application.
    // The initial theme is set by the script tag.
    // This useEffect can be used for dynamic updates post-hydration if needed,
    // but the settings page already handles that.
  }, []);

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
