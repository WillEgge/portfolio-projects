"use client";

import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem
      disableTransitionOnChange
    >
      {/* 
        This script runs before React hydration, setting the initial theme
        based on user's system preference or previous selection,
        preventing the flash of wrong theme
      */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              function getThemePreference() {
                if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
                  return localStorage.getItem('theme');
                }
                return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              }
              
              const theme = getThemePreference();
              
              // Apply theme immediately to prevent flash
              document.documentElement.classList.toggle('dark', theme === 'dark');
              document.documentElement.style.colorScheme = theme;
              
              // Enable CSS transitions after theme is set
              window.setTimeout(function() {
                document.documentElement.setAttribute('data-theme-loaded', 'true');
              }, 0);
            })();
          `,
        }}
      />
      {children}
    </ThemeProvider>
  );
}
