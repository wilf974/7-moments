import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StorageSync from "@/components/StorageSync";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "7 Rendez-vous de Prière",
  description: "Application pour suivre vos 7 moments de prière quotidiens. Prenez un moment de recueillement dans votre journée pour vous connecter à Dieu.",
  keywords: ["prière", "spiritualité", "recueillement", "foi", "quotidien", "moment"],
  authors: [{ name: "7RDV Team" }],
  creator: "7RDV Team",
  publisher: "7RDV",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://prayer.yourdomain.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "7 Rendez-vous de Prière",
    description: "Application pour suivre vos 7 moments de prière quotidiens",
    url: 'https://prayer.yourdomain.com',
    siteName: '7 Rendez-vous de Prière',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '7 Rendez-vous de Prière',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "7 Rendez-vous de Prière",
    description: "Application pour suivre vos 7 moments de prière quotidiens",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '7 Rendez-vous de Prière',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#8b5cf6' },
    { media: '(prefers-color-scheme: dark)', color: '#7c3aed' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="7 Rendez-vous de Prière" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StorageSync />
        {children}
      </body>
    </html>
  );
}
