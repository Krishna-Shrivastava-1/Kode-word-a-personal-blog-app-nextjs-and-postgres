import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ContextProvider } from "@/components/ContextAPI";
import { Analytics } from "@vercel/analytics/next"
import ChatWidget from "@/components/ChatWidget";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/chatSideBar";
import { cookies } from "next/headers";
import ClientSidebarWrapper from "@/components/ClientSidebarWrapper";
import { GoogleAnalytics } from '@next/third-parties/google';
import ReCaptchaProvider from "./ReCaptchaProvider";
import FeatureAnnouncement from "@/components/FeatureAnnouncement";

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
    default: 'Kode$word | LeetCode Java Solutions & Technical Blog',
    // default: 'Kode$word | Krishna Shrivastava - Full-Stack Developer Portfolio & Blog',
    template: '%s | Kode$word'
  },

  description: 'Master LeetCode with Kode$word. Expert Java solutions, step-by-step dry runs, and Full-Stack projects (Spring Boot, Next.js) by Krishna Shrivastava.',
  // description: 'The coding journey of Krishna Shrivastava. Explore full-stack projects (Spring Boot, Next.js), LeetCode solutions, and insights into building scalable applications like krido, kodesword and more.',
  
  
  keywords: [
    // Personal Brand & Core Focus
    'Krishna Shrivastava',
    'Kode$word',
    'KodeSword',
    'Krishna',
    'LeetCode Java Solutions',
    'GFG Java Solutions',
    'Kodesword',
    'Developer Portfolio',
    'Coding Journey',
    'Full-Stack Developer India',
    'Java Algorithm Explanations',
    'Coding Blog',
    'Software Engineering Journey',
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
    'React Native Expo',
    'Mongodb',
    'my first'
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
    description: 'In-depth Java LeetCode solutions and full-stack engineering insights by Krishna Shrivastava. Focus on dry runs, complexity analysis, and scalable systems.',
    siteName: 'KodeSword',
    images: [
      {
        url: '/favicon.ico', // Make sure you have an image file in your public folder!
        width: 1200,
        height: 630,
        alt: 'KodeSword - Krishna Shrivastava Portfolio',
      },
    ],
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'Krishna Shrivastava | Kode$word',
    description: 'Full-Stack Developer building scalable system and projects like BrilliCode and sharing knowledge on Kode$word.',
    creator: '@Krishna__Stark', // Add this if you have one
    site: '@Krishna__Stark',
    images: ['https://kodesword.vercel.app/twitter-image.png']
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
      "name": "KodeSword",
      "alternateName": "Kode$word",
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
        "https://github.com/Krishna-Shrivastava-1", // Add your real GitHub link here
        "https://linkedin.com/in/krishna-shrivastava-62b72129a" // Add your real LinkedIn link here
      ],
      "worksFor": {
        "@type": "Organization",
        "name": "Self-Employed"
      },
      "description": "Full-Stack Developer building projects like BrilliCode and sharing knowledge on Kode$word."
    }
  ];

  // return (
  //   <html lang="en">
  //     <head>
  //       <script
  //         type="application/ld+json"
  //         dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
  //       />
  //     </head>
  //     <body suppressHydrationWarning
  //       className={`${geistSans.variable} ${geistMono.variable} antialiased`}
  //     >
  //       <ContextProvider>
  //          <SidebarProvider>
    
  //     <main>
  //         {children}
  //         <SidebarTrigger />
  //     </main>
  //       <AppSidebar />
  //          </SidebarProvider>
  //         <Analytics />
  //         <Toaster richColors />
  //       </ContextProvider>



  //     </body>
  //   </html>
  // );

   return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReCaptchaProvider>
        <ContextProvider>
          <ClientSidebarWrapper>
            <FeatureAnnouncement />
            {children}
            {/* <ChatWidget /> */}
          </ClientSidebarWrapper>
          <Analytics />
          {/* Google analystics new ID here */}
         <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
          <Toaster richColors />
        </ContextProvider>
        </ReCaptchaProvider>
      </body>
    </html>
  )
}
