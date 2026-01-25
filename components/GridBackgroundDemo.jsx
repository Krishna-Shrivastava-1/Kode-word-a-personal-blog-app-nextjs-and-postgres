import { Authorized } from "@/controllers/authControl";
import { cn } from "@/lib/utils";
import React from "react";
import Dashboard from "./Dashboard";
import MarqueeBlog from "./MarqueeBlog";
import pool from "@/lib/db";
import SocialSection from "./SocialSection";
import HireMeSection from "./HireMeSection";
import Link from "next/link";
import { QrCode } from "lucide-react";

export async function GridBackgroundDemo() {
  const isuserauthor = await Authorized()
    const result = await pool.query(`
    SELECT p.title,p.slug,p.id,p.subTitle,p.thumbnailimage, u.name 
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.public = TRUE
    ORDER BY p.created_at DESC
    LIMIT 6
  `)

  const postForMarquee = result.rows

  return (
    <>
    {
      isuserauthor?.success ?
      <div>
        <Dashboard />

      </div>
      :
      <div>

    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-white px-4 py-12 sm:py-20 dark:bg-black">
  {/* Grid Background - Responsive size */}
  <div
    className={cn(
      "absolute inset-0",
      "[background-size:30px_30px] sm:[background-size:40px_40px]",
      "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
      "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
    )}
  />
  
  {/* Radial Gradient Overlay */}
  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black" />
  
  {/* Content Container - FULL RESPONSIVE */}
  <div className="relative mt-8 z-20 mx-auto w-full max-w-4xl px-4 sm:px-6 md:px-8 text-center">
    {/* Main Heading - MOBILE FIRST */}
    <h1 className="bg-gradient-to-b from-neutral-900 via-neutral-700 to-neutral-500 bg-clip-text py-2 text-3xl font-black leading-tight text-transparent xs:text-xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl break-words hyphens-auto overflow-wrap-break-word">
      From Small Steps to Big Impact
    </h1>
    
    {/* Subheading - MOBILE FIRST */}
    <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 xs:text-base sm:text-lg md:text-xl break-words hyphens-auto">
     Documenting my journey in software development—sharing insights, lessons, and ideas through carefully crafted posts that reflect how I think, build, and grow.
    </p>
    
    {/* CTA Buttons - FULL RESPONSIVE */}
    <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4">
      <a
        href="/sign-up"
        className="group relative flex w-full items-center justify-center overflow-hidden rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-primary/30 sm:px-8 sm:py-3 sm:text-base sm:w-auto"
      >
        Join Us
        <svg
          className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 sm:h-5 sm:w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      </a>
      
      <a
        href="/blog"
        className="flex w-full items-center justify-center rounded-lg border-2 border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-900 transition-all duration-200 hover:border-neutral-400 hover:bg-neutral-50 focus:outline-none focus:ring-4 focus:ring-neutral-200/50 dark:border-neutral-700 dark:text-neutral-100 dark:hover:border-neutral-600 dark:hover:bg-neutral-900 sm:px-8 sm:py-3 sm:text-base sm:w-auto"
      >
        Explore Articles
      </a>
    </div>
    
    {/* Marquee - Responsive */}
    <div className="mt-12 w-full">
      <MarqueeBlog postData={postForMarquee} />
    </div>
    
  </div>
  
</div>


<SocialSection />
<HireMeSection />
<section className="py-16 bg-gradient-to-r from-yellow-50 to-orange-50">
  <div className="max-w-4xl mx-auto px-4 text-center">
    <div className="inline-block p-3 bg-yellow-400 rounded-full mb-4">
      ☕
    </div>
    <h2 className="text-3xl font-bold text-gray-900 mb-4">
      Support My Work
    </h2>
    <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
      If you enjoy my content and find it valuable, consider buying me a coffee! 
      Your support helps me create more quality articles and keep this platform running.
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
    
      <Link
        href={'/support'}
       
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
      >
           <QrCode className="w-6 h-6 text-white" /> Scan QR
      </Link>
    </div>
  </div>
</section>
      </div>

    }
    </>
    

  );
}
