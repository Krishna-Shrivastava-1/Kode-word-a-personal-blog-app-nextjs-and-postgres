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
    default: 'Kode$word | Krishna Shrivastava - Full-Stack Developer Portfolio & Blog',
    template: '%s | Kode$word'
  },
  
  description: 'The coding journey of Krishna Shrivastava. Explore full-stack projects (Spring Boot, Next.js), LeetCode solutions, and insights into building scalable applications like KriCal and more.',
  
  keywords: [
    // Personal Brand & Core Focus
    'Krishna Shrivastava',
    'Kode$word',
    'Developer Portfolio',
    'Coding Journey',
    'Full-Stack Developer India',
    
    // Specific Projects (Crucial for "Not just tutorials")
    'KriCal App',
    'Spring Boot Backend Project',
    'Render Deployment',
    'System Design Examples',
    
    // Tech Stack & Solutions
    'Next.js Projects',
    'LeetCode Solutions Java',
    'Maximum Subarray Solution',
    'Sort Colors LeetCode',
    'PostgreSQL Database',
    'React Native Expo'
  ],

  authors: [
    { 
      name: 'Krishna Shrivastava',
      url: 'https://kodesword.vercel.app'
    }
  ],
  creator: 'Krishna Shrivastava',
  publisher: 'Krishna Shrivastava',
  
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
    type: 'profile', // Tells social networks this is a person's profile/portfolio
    firstName: 'Krishna',
    lastName: 'Shrivastava',
    username: 'kodesword',
    locale: 'en_US',
    url: 'https://kodesword.vercel.app',
    title: 'Krishna Shrivastava - Developer Portfolio & Blog',
    description: 'Explore my projects, LeetCode solutions, and full-stack development journey.',
    siteName: 'Kode$word',
    images: [
      {
        url: '/og-image.png', // Make sure you have an image file in your public folder!
        width: 1200,
        height: 630,
        alt: 'Kode$word - Krishna Shrivastava Portfolio',
      },
    ],
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'Krishna Shrivastava | Kode$word',
    description: 'Building KriCal, solving LeetCode, and mastering System Design.',
    creator: '@yourtwitterhandle', // Add this if you have one
  },

  category: 'technology',
  
  verification: {
    google: 'XYvvJnprRX07fyrSHczqz4d1hocQcEWVJ_rYPK6ZWu4',
    other: {
      'msvalidate.01': '3A8DA7BB958574D4916449250BA74941',
    },
  },
  
  other: {
    'copyright': `© ${new Date().getFullYear()} Krishna Shrivastava. All rights reserved.`,
  },
}

export default function RootLayout({ children }) {
  // Enhanced Schema: Connects "Person" (You) to the "WebSite" (Kode$word)
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Kode$word",
      "url": "https://kodesword.vercel.app",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://kodesword.vercel.app/blog?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Krishna Shrivastava",
      "url": "https://kodesword.vercel.app",
      "jobTitle": "Full-Stack Developer",
      "sameAs": [
        "https://github.com/yourusername", // Add your real GitHub link here
        "https://linkedin.com/in/yourusername" // Add your real LinkedIn link here
      ],
      "worksFor": {
        "@type": "Organization",
        "name": "Self-Employed"
      },
      "description": "Full-Stack Developer building projects like KriCal and sharing knowledge on Kode$word."
    }
  ];

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
