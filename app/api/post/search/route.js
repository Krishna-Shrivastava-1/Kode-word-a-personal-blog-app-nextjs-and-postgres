import pool from "@/lib/db";
import { NextResponse } from "next/server"

export async function POST(req, res) {
    try {
        const { query } = await req.json()
        if (!query || query.trim().length === 0) {
            return NextResponse.json({
                message: "no query to search",
                success: false
            })
        }
        const tsQuery = query.trim().split(/\s+/).join(' & ');
        const result = await pool.query(`
      SELECT id, title, subTitle, tag, content,thumbnailImage,
             ts_rank(tsv, to_tsquery('english', $1)) AS rank
      FROM posts
      WHERE tsv @@ to_tsquery('english', $1)
      AND public = true
      ORDER BY rank DESC
      LIMIT 20
    `, [tsQuery]);
        return NextResponse.json({
            message: 'search results found',
            result: result.rows,
            totalresult:result?.rows?.length,
            success: true
        })
    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json(
            { success: false, message: 'Server error' },
            { status: 500 }
        )
    }
}