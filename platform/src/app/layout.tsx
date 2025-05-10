// /home/ubuntu/traittune_frontend/src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "../components/providers/I18nProvider"; // Import the provider
import { LanguageSwitcher } from "../components/LanguageSwitcher"; // Import the LanguageSwitcher

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TraitTune Assessment", // Updated title
  description: "AI-Driven Personality Assessment", // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning> 
      {/* Added suppressHydrationWarning for potential i18next + Next.js issues */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <I18nProvider>
          <LanguageSwitcher /> {/* Add the LanguageSwitcher here */}
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}

