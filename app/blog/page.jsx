// import BlogCards from '@/components/BlogCards'
// import Navbar from '@/components/Navbar'

// import React from 'react'

// const page =async () => {
   
//   return (
//     <div>
//       <Navbar />
// <BlogCards />
//     </div>
//   )
// }

// export default page



import BlogCards from '@/components/BlogCards'
import Navbar from '@/components/Navbar'
import pool from '@/lib/db'

// ✅ Add metadata for the blog listing page
export const metadata = {
  title: 'All Posts - Programming Tutorials & Articles',
  description: 'Browse all programming tutorials, web development guides, and tech articles on Kode$word. Learn Next.js, React, system design, DSA, and more.',
  
  keywords: [
    'programming tutorials',
    'coding articles',
    'web development blog',
    'tech tutorials',
    'Next.js guides',
    'React tutorials',
    'system design',
    'DSA tutorials',
    'developer blog'
  ],
  
  openGraph: {
    title: 'All Posts - Kode$word Programming Blog',
    description: 'Browse all programming tutorials, web development guides, and tech articles.',
    type: 'website',
    url: 'https://kodesword.vercel.app/blog',
    siteName: 'Kode$word',
  },
  
  alternates: {
    canonical: 'https://kodesword.vercel.app/blog',
  },
  
  robots: {
    index: true,
    follow: true,
  },
}

const page = async () => {
  // ✅ Fetch recent posts for JSON-LD (optional but recommended)
  let recentPosts = []
  try {
    const result = await pool.query(`
      SELECT id, title, subtitle, created_at 
      FROM posts 
      WHERE public = true 
      ORDER BY created_at DESC 
      LIMIT 10
    `)
    recentPosts = result.rows
  } catch (error) {
    console.error('Error fetching posts for schema:', error)
  }

  // ✅ JSON-LD for CollectionPage
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "All Blog Posts - Kode$word",
    "description": "Collection of programming tutorials and web development articles",
    "url": "https://kodesword.vercel.app/blog",
    "publisher": {
      "@type": "Person",
      "name": "Krishna Shrivastava"
    },
    "inLanguage": "en-US",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": recentPosts.map((post, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://kodesword.vercel.app/blog/${post.id}`,
        "name": post.title,
        "description": post.subtitle
      }))
    }
  }

  return (
    <>
      {/* ✅ JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div>
        <Navbar />
        <main>
          <BlogCards />
        </main>
      </div>
    </>
  )
}

export default page

