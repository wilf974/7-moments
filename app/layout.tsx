import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import StorageSync from "@/components/StorageSync";
import StorageInit from "@/components/StorageInit";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
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
  metadataBase: new URL('https://7moments.woutils.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "7 Rendez-vous de Prière",
    description: "Application pour suivre vos 7 moments de prière quotidiens",
    url: 'https://7moments.woutils.com',
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
    { media: '(prefers-color-scheme: light)', color: '#D97706' },
    { media: '(prefers-color-scheme: dark)', color: '#92400E' },
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
        className={`${playfair.variable} ${inter.variable} antialiased`}
      >
        <StorageSync />
        <StorageInit />
        {children}
      </body>
    </html>
  );
}
