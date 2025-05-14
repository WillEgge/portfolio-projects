"use client";

import Link from "next/link";
import { MoonIcon, SunIcon, CloudRainIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Header() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Set mounted to true once component is mounted
  useEffect(() => setMounted(true), []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <div className="flex items-center gap-2 mr-4">
          <CloudRainIcon className="h-6 w-6" />
          <Link href="/" className="font-bold text-xl">
            Weather App
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Only render the actual theme button once mounted */}
          {mounted ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              <SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          ) : (
            /* Show a placeholder button while mounting */
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              disabled
            >
              <SunIcon className="h-5 w-5" />
              <span className="sr-only">Loading theme</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
