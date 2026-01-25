import pool from '@/lib/db'
import { NextResponse } from 'next/server'


export async function PATCH(req, { params }) {
  try {
    const { id } = await params
    const { title, subtitle, tag, content, thumbnailImage,slug,prevSlug } = await req.json()

    if (!title || !content || !slug) {
      return NextResponse.json(
        { success: false, message: 'Title, content and slug are required' },
        { status: 400 }
      )
    }
const resptoDele = await fetch(
  `${process.env.DELETEEMBEDINGOFBLOG}/${prevSlug}`,
  { method: "DELETE" }
)
 await pool.query(
      `UPDATE posts 
       SET title = $1, subTitle = $2, tag = $3, content = $4, thumbnailImage = $5, slug=$6
       WHERE id = $7`,
      [title, subtitle, tag, content, thumbnailImage,slug, id]
    )
    const resp = await fetch(process.env.SENDBLOGIDTOCHAT,{
    method:'POST',
     headers: {
        "Content-Type": "application/json",
      },
    body:JSON.stringify({blog_id:slug})
  })
const data = await resp.json()
console.log(data)
// if(data?.chunks_stored ==0){
// return NextResponse.json({
//   message:`Error in creating embedding of this edited blog `
// })
// }
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
