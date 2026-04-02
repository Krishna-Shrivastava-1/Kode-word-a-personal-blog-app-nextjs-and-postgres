import { unstable_cache } from 'next/cache';
import pool from './db';

// 1. CACHED: The "Heavy" Static Content
// This is shared by every user who visits this post.
export const getCachedPostContent = unstable_cache(
  async (idOrSlug) => {
    // console.log(`--- DATABASE HIT FOR CONTENT: ${idOrSlug} ---`);
    const result = await pool.query(
      `SELECT p.id, p.title, p.content, p.slug, p.created_at, u.name, p.tag, p.thumbnailimage,p.subtitle
       FROM posts p 
       JOIN users u ON p.user_id = u.id
       WHERE (p.id::text = $1 OR p.slug = $1) AND p.public = TRUE`,
      [idOrSlug]
    );
    return result.rows[0];
  },
  ['post-content-body'], // Next.js automatically adds the 'idOrSlug' to this key
  { 
    revalidate: 3600, 
    tags: ['posts-content'] // Keep this static to avoid scope errors
  }
);

// 2. DYNAMIC: The "Live" Stats & User State
// This runs every time the page loads to ensure accuracy.
export async function getLivePostData(postId, userId) {
  const result = await pool.query(
    `SELECT 
    p.views,
    p.public,
      COALESCE((SELECT COUNT(*) FROM post_likes WHERE post_id = $1), 0) AS like_count,
      COALESCE((SELECT COUNT(*) FROM bookmark_user WHERE post_id = $1), 0) AS bookmark_count,
      EXISTS (SELECT 1 FROM post_likes WHERE post_id = $1 AND user_id = $2) AS liked_by_me,
      EXISTS (SELECT 1 FROM bookmark_user WHERE post_id = $1 AND user_id = $2) AS bookmarked_by_me
      FROM posts p
    WHERE p.id = $1
    `,
    [postId, userId || null]
  );
  return result.rows[0];
}