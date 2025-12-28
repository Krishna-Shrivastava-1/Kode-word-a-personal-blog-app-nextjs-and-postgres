import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ContextProvider } from "@/components/ContextAPI";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL('https://kodesword.vercel.app'),
  
  title: {
    default: 'Kode$word - Programming Tutorials & Developer Blog',
    template: '%s | Kode$word'
  },
  
  description: 'Discover in-depth programming tutorials, web development guides, and tech insights. Learn Next.js, React, system design, full-stack development, and modern coding practices.',
  
 keywords: [
  // Primary focus
  'programming blog',
  'Kode$word',
  'Krishna Shrivastava blog',
  
  // Web development
  'web development tutorials',
  'full-stack development',
  'frontend development',
  'backend development',
  
  // Frameworks & technologies
  'Next.js tutorials',
  'React tutorials',
  'Node.js',
  'TypeScript tutorials',
  'JavaScript tutorials',
  'React Native',
  'Spring Boot',
  
  // DSA & competitive programming
  'data structures and algorithms',
  'DSA tutorials',
  'LeetCode solutions',
  'coding interview prep',
  'competitive programming',
  
  // System design & architecture
  'system design tutorials',
  'scalability',
  'microservices',
  
  // AI & trending topics
  'AI tutorials',
  'machine learning basics',
  'Python tutorials',
  
  // General developer content
  'coding tips',
  'developer blog',
  'programming tips',
  'tech articles',
  'software engineering blog'
],

  
  authors: [
    { 
      name: 'Krishna Shrivastava',
      url: 'https://kodesword.vercel.app'
    }
  ],
  creator: 'Krishna Shrivastava',
  publisher: 'Kode$word',
  
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
    url: 'https://kodesword.vercel.app',
    title: 'Kode$word - Programming Tutorials & Developer Blog',
    description: 'Discover in-depth programming tutorials, web development guides, and tech insights for modern developers.',
    siteName: 'Kode$word',
  },
  
  alternates: {
    canonical: 'https://kodesword.vercel.app',
  },
  
  category: 'technology',
  
  verification: {
    google: 'XYvvJnprRX07fyrSHczqz4d1hocQcEWVJ_rYPK6ZWu4',
    other: {
      'msvalidate.01': '3A8DA7BB958574D4916449250BA74941',
    },
  },
  
  other: {
    'author': 'Krishna Shrivastava',
    'copyright': '© 2025 Kode$word. All rights reserved.',
  },
}

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Kode$word",
    "url": "https://kodesword.vercel.app",
    "description": "Programming tutorials and web development guides for modern developers",
    "publisher": {
      "@type": "Person",
      "name": "Krishna Shrivastava"
    },
    "author": {
      "@type": "Person",
      "name": "Krishna Shrivastava"
    },
    "inLanguage": "en-US"
  };

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
        <ContextProvider>
          {children}
          <Toaster richColors />
        </ContextProvider>
      </body>
    </html>
  );
}
