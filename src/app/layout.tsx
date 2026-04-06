import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { AuthProvider } from "@/contexts/auth-context";
import "./globals.css";

const interFont = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
      className={`${interFont.variable} ${playfairDisplay.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full bg-background text-foreground"
        suppressHydrationWarning
      >
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
