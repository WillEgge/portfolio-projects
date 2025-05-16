/**
 * Root layout component for the entire application
 * 
 * Provides the application shell, theme provider, and global components like the header and toast notifications.
 * 
 * @module layout
 */
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import Header from "@/components/Header";
import { Providers } from "@/components/Provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Weather App",
  description: "A simple weather app built with Next.js",
};

/**
 * Root layout component that wraps the entire application
 * 
 * Configures the font, theme provider, and application shell with header and toast notifications.
 * 
 * @param children - The page content to be rendered inside the layout
 * @returns The application shell with configured providers and components
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Toaster position="bottom-right" />
          <div className="fixed bottom-1 right-2 text-[10px] text-muted-foreground/30 select-none pointer-events-none">
            v1.0.0
          </div>
        </Providers>
      </body>
    </html>
  );
}
