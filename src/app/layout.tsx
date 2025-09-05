import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Asset Extractor - Remove Backgrounds & Extract Assets Online",
  description: "Fast, free background remover tool. Upload any image, select objects, and download transparent PNG assets instantly. No signup required - powered by AI.",
  keywords: "background remover, transparent PNG, asset extractor, remove background, AI background removal, extract objects, free tool",
  authors: [{ name: "Asset Extractor Team" }],
  creator: "Asset Extractor",
  publisher: "Asset Extractor",
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://asset-extractor.com',
    title: 'Asset Extractor - Remove Backgrounds & Extract Assets Online',
    description: 'Fast, free background remover tool. Upload any image, select objects, and download transparent PNG assets instantly.',
    siteName: 'Asset Extractor',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Asset Extractor - Remove Backgrounds & Extract Assets Online',
    description: 'Fast, free background remover tool. Upload any image, select objects, and download transparent PNG assets instantly.',
    creator: '@shukerullah',
  },
  verification: {
    google: 'your-google-verification-code-here',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Asset Extractor",
  "url": "https://asset-extractor.com",
  "description": "Fast, free background remover tool. Upload any image, select objects, and download transparent PNG assets instantly.",
  "applicationCategory": "GraphicsApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "author": {
    "@type": "Organization",
    "name": "Asset Extractor Team"
  },
  "featureList": [
    "Background removal",
    "Object extraction", 
    "Transparent PNG generation",
    "Batch processing",
    "AI-powered processing"
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
