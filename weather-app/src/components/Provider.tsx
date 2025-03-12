"use client";
import { ProviderProps } from "@/lib/types";
import { ThemeProvider } from "next-themes";
export function Providers({
  children,
  defaultTheme = "system",
  enableSystem = true,
}: ProviderProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
    >
      {children}
    </ThemeProvider>
  );
}
