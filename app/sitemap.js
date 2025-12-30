import pool from "@/lib/db"

export default async function sitemap() {
  const baseUrl = 'https://kodesword.vercel.app'
  
  try {
    // Fetch all public blog posts
    const result = await pool.query(`
      SELECT slug, created_at
      FROM posts 
      WHERE public = true 
      ORDER BY created_at DESC
    `)
    
    // Create sitemap entry for each blog post
    const posts = result.rows.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified:  post.created_at,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      ...posts,
    ]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ]
  }
}
