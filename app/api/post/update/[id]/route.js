import pool from '@/lib/db'
import { NextResponse } from 'next/server'


export async function PATCH(req, { params }) {
  try {
    const { id } = await params
    const { title, subtitle, tag, content, thumbnailImage,slug } = await req.json()

    if (!title || !content || !slug) {
      return NextResponse.json(
        { success: false, message: 'Title, content and slug are required' },
        { status: 400 }
      )
    }

    await pool.query(
      `UPDATE posts 
       SET title = $1, subTitle = $2, tag = $3, content = $4, thumbnailImage = $5, slug=$6
       WHERE id = $7`,
      [title, subtitle, tag, content, thumbnailImage,slug, id]
    )

    return NextResponse.json({
      success: true,
      message: 'Post updated successfully',
    })
  } catch (error) {
    console.error('Update post error:', error.message)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
