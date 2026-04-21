import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { RealTimeManager } from "@/components/real-time-manager";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "J'ARRIVE Logistique",
  description: "Livraison rapide et sécurisée au Congo",
  manifest: "/manifest.json",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "format-detection": "telephone=no",
  }
};

import Chatbot from "@/components/chatbot";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className="h-full antialiased light"
      style={{ colorScheme: 'light' }}
    >
      <head>
        <link rel="dns-prefetch" href="https://kbrokfbqlgrhzuicblkv.supabase.co" />
        <link rel="preconnect" href="https://kbrokfbqlgrhzuicblkv.supabase.co" />
      </head>
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        <Toaster position="top-center" richColors />
        <RealTimeManager />
        {children}
        <Chatbot />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
                window.addEventListener('load', function() {
                  setTimeout(() => {
                    navigator.serviceWorker.register('/sw.js').catch(console.error);
                  }, 2000); // Delay registration for Safari performance
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
