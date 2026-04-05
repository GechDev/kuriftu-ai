<<<<<<< HEAD
import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { FloatingChatbot } from "@/components/chat/FloatingChatbot";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
=======
import { AppShell } from "@/components/app-shell";
import { AuthProvider } from "@/contexts/auth-context";
import type { Metadata } from "next";
import { Cormorant_Garamond, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
>>>>>>> 088361d3f8db2167b4729ad2ffccf5e7ce4adb03
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

<<<<<<< HEAD
export const metadata: Metadata = {
  title: "Kuriftu NEXORA | AI Hospitality Intelligence",
  description:
    "Where Hospitality Meets Intelligence. Automate guest experiences, optimize pricing, and power management insights for Kuriftu Resort.",
  keywords: [
    "hospitality AI",
    "hotel pricing",
    "Kuriftu",
    "IntelliRate",
    "NEXORA",
    "dynamic pricing",
    "resort technology",
  ],
=======
const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Kuriftu — Voice concierge & resort stays",
  description:
    "Talk with our voice agent about rooms, resorts, and services—then book and manage your stay on the web. Lakeside and garden properties across the collection.",
>>>>>>> 088361d3f8db2167b4729ad2ffccf5e7ce4adb03
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
<<<<<<< HEAD
    <html lang="en" className={`${plusJakarta.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
        <FloatingChatbot />
=======
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white text-foreground">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
>>>>>>> 088361d3f8db2167b4729ad2ffccf5e7ce4adb03
      </body>
    </html>
  );
}
