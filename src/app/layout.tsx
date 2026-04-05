import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans, Cormorant_Garamond } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { AuthProvider } from "@/contexts/auth-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
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
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} ${plusJakarta.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full bg-white text-foreground"
        suppressHydrationWarning
      >
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
