// import pool from "@/lib/db"

// export default async function sitemap() {
//   const baseUrl = 'https://kodesword.vercel.app'
  
//   try {
//     // Fetch all public blog posts
//     const result = await pool.query(`
//       SELECT id, created_at
//       FROM posts 
//       WHERE public = true 
//       ORDER BY created_at DESC
//     `)
    
//     // Create sitemap entry for each blog post
//     const posts = result.rows.map((post) => ({
//       url: `${baseUrl}/blog/${post.id}`,
//       lastModified:  post.created_at,
//       changeFrequency: 'weekly',
//       priority: 0.8,
//     }))

//     return [
//       {
//         url: baseUrl,
//         lastModified: new Date(),
//         changeFrequency: 'daily',
//         priority: 1,
//       },
//       {
//         url: `${baseUrl}/blog`,
//         lastModified: new Date(),
//         changeFrequency: 'daily',
//         priority: 0.9,
//       },
//       ...posts,
//     ]
//   } catch (error) {
//     console.error('Error generating sitemap:', error)
//     return [
//       {
//         url: baseUrl,
//         lastModified: new Date(),
//         changeFrequency: 'daily',
//         priority: 1,
//       },
//     ]
//   }
// }

import pool from "@/lib/db"

export default async function sitemap() {
  const baseUrl = 'https://kodesword.vercel.app'
  
  try {
    // Fetch all public blog posts with slugs/titles for better SEO
    const result = await pool.query(`
      SELECT id, slug, title, created_at, updated_at
      FROM posts 
      WHERE public = true 
      ORDER BY updated_at DESC
    `)
    
    const posts = result.rows.map((post) => ({
      url: `${baseUrl}/blog/${post.slug || post.id}`,
      lastModified: new Date(post.updated_at || post.created_at).toISOString(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    // Static high-priority pages (homepage shows for "kodesword")
    const staticPages = [
      {
        url: baseUrl,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/about`,  // Add if exists, or create simple page
        lastModified: new Date().toISOString(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
    ]

    return [...staticPages, ...posts]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return [
      { url: baseUrl, lastModified: new Date().toISOString(), changeFrequency: 'daily', priority: 1.0 },
    ]
  }
}
