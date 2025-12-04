import pool from '@/lib/db'
import { NextResponse } from 'next/server'


export async function POST(request) {
  try {
    const { postId } = await request.json()
    if (!postId) {
      return NextResponse.json({ success: false, message: 'Post ID required' }, { status: 400 })
    }
    await pool.query('UPDATE posts SET views = views + 1 WHERE id = $1', [postId])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('View increment error:', error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
