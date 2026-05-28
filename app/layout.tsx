// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeScript } from "@/components/ThemeScript";
import { PwaRegistration } from "@/components/PwaRegistration";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Carimail — Email by Hostcari",
    template: "%s | Carimail",
  },
  description:
    "A polished, privacy-first email client that connects to any IMAP/SMTP provider. Built for Hostcari clients and anyone who deserves a better inbox.",
  icons: { icon: "/logo.webp", apple: "/logo.webp" },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Carimail",
  },
  applicationName: "Carimail",
  keywords: ["email", "mail client", "IMAP", "inbox", "Hostcari"],
  openGraph: {
    type: "website",
    siteName: "Carimail",
    title: "Carimail — Email by Hostcari",
    description: "A polished email client for any IMAP provider.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F97316" },
    { media: "(prefers-color-scheme: dark)", color: "#F97316" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <ThemeScript />
      </head>
      <body className="antialiased">
        {children}
        <PwaRegistration />
      </body>
    </html>
  );
}