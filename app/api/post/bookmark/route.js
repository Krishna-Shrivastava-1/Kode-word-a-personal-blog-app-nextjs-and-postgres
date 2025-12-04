import pool from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req, res) {
  try {
    const { userid, postid } = await req.json()

    // Check if user already liked this post
    const checkUserHaveBookMarkOrNot = await pool.query(
      `SELECT 1 FROM bookmark_user WHERE post_id = $1 AND user_id = $2`,
      [postid, userid]
    )

    const hasBookMarked = checkUserHaveBookMarkOrNot.rows.length > 0

    if (hasBookMarked) {
      // Unlike: remove the like
      await pool.query(
        `DELETE FROM bookmark_user WHERE post_id = $1 AND user_id = $2`,
        [postid, userid]
      )
    } else {
      // Like: insert new like
      await pool.query(
        `INSERT INTO bookmark_user (post_id, user_id) VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [postid, userid]
      )
    }

    // Get updated like count for this post
    const countResult = await pool.query(
      `SELECT COUNT(*) as count FROM bookmark_user WHERE post_id = $1 AND user_id = $2`,
      [postid,userid]
    )

    const bookmarkCount = parseInt(countResult.rows[0].count, 10)

    return NextResponse.json({
      success: true,
      liked: !hasBookMarked, // New state (toggled)
      bookmarkCount: bookmarkCount,
    })

  } catch (error) {
    console.error('Like toggle error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
