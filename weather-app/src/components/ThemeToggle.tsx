"use client";

/**
 * Theme toggle component for switching between light and dark modes
 * 
 * Provides a hydration-safe toggle button for changing the application theme.
 * Takes care of proper mounting and avoiding layout shifts during hydration.
 * 
 * @module ThemeToggle
 */
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { MoonIcon, SunIcon } from "lucide-react";

/**
 * ThemeToggle component for switching between light and dark modes
 * 
 * Handles theme switching with proper hydration safety through mounted state.
 * Different buttons are displayed based on the current theme.
 * 
 * @returns Theme toggle button appropriate for the current theme
 */
export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  // Only show theme toggle after component has mounted to avoid hydration mismatch
  useEffect(() => {
    // Small delay to ensure theme is fully applied before showing the toggle
    const timeout = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  // Return a skeleton button before mounting to avoid layout shift
  // Use visibility: hidden instead of opacity to ensure it doesn't interfere with hydration
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="invisible"
        aria-hidden="true"
        tabIndex={-1}
      >
        <SunIcon className="h-5 w-5" />
      </Button>
    );
  }

  if (resolvedTheme === "dark") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme("light")}
        aria-label="Switch to light theme"
      >
        <SunIcon className="h-5 w-5" />
        <span className="sr-only">Switch to light theme</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme("dark")}
      aria-label="Switch to dark theme"
    >
      <MoonIcon className="h-5 w-5" />
      <span className="sr-only">Switch to dark theme</span>
    </Button>
  );
}
