// 'use server'

// import pool from "@/lib/db"


// export async function searchPosts(query) {
//   if (!query || query.trim().length === 0) {
//     return { posts: [], error: null }
//   }

//   try {
//     // Sanitize and transform query
//     const tsQuery = query.trim().split(/\s+/).join(' & ')

//     const result = await pool.query(`
//         SELECT id, title, subTitle, tag, content,
//              ts_rank(tsv, to_tsquery('english', $1)) AS rank
//       FROM posts
//       WHERE tsv @@ to_tsquery('english', $1)
//       AND public = true
//       ORDER BY rank DESC
//     `, [tsQuery])

//     return { posts: result.rows, error: null,success:true,totalResults:result.rows.length }
//   } catch (error) {
//     console.error('Search error:', error)
//     return { posts: [], error: 'Search failed' }
//   }
// }



'use server'

import pool from "@/lib/db"

export async function searchPosts(query) {
  if (!query || query.trim().length === 0) {
    return { posts: [], error: null }
  }

  try {
    // Use websearch_to_tsquery for natural language search
    // It handles phrases, quotes, and multiple words gracefully
    const result = await pool.query(`
      SELECT 
        id, title, subTitle, tag,slug, content,
        ts_rank(tsv, websearch_to_tsquery('english', $1)) AS rank
      FROM posts
      WHERE tsv @@ websearch_to_tsquery('english', $1)
        AND public = true
      ORDER BY rank DESC
      LIMIT 50
    `, [query.trim()])

    return { 
      posts: result.rows, 
      error: null,
      success: true,
      totalResults: result.rows.length 
    }
  } catch (error) {
    console.error('Search error:', error)
    // Fallback to ILIKE for partial matches if full-text fails
    try {
      const likeQuery = `%${query.trim()}%`
      const fallbackResult = await pool.query(`
        SELECT id, title, subTitle,slug, tag, content, 0 AS rank
        FROM posts
        WHERE (title ILIKE $1 OR content ILIKE $1)
          AND public = true
        ORDER BY title
        LIMIT 50
      `, [likeQuery])
      
      return { 
        posts: fallbackResult.rows, 
        error: null,
        success: true,
        totalResults: fallbackResult.rows.length 
      }
    } catch (fallbackError) {
      return { posts: [], error: 'Search failed' }
    }
  }
}
