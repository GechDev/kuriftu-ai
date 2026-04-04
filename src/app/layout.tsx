import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { FloatingChatbot } from "@/components/chat/FloatingChatbot";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
        <FloatingChatbot />
      </body>
    </html>
  );
}
