'use server'

import pool from "@/lib/db"


export async function searchPosts(query) {
  if (!query || query.trim().length === 0) {
    return { posts: [], error: null }
  }

  try {
    // Sanitize and transform query
    const tsQuery = query.trim().split(/\s+/).join(' & ')

    const result = await pool.query(`
        SELECT id, title, subTitle, tag, content,
             ts_rank(tsv, to_tsquery('english', $1)) AS rank
      FROM posts
      WHERE tsv @@ to_tsquery('english', $1)
      AND public = true
      ORDER BY rank DESC
    `, [tsQuery])

    return { posts: result.rows, error: null,success:true,totalResults:result.rows.length }
  } catch (error) {
    console.error('Search error:', error)
    return { posts: [], error: 'Search failed' }
  }
}
