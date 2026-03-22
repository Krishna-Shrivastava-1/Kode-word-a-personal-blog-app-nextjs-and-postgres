// // app/api/delete-video/route.js
// import { del } from '@vercel/blob'
// import { NextResponse } from 'next/server'

// export async function POST(request) {
//   try {
//     const { videoUrl } = await request.json()

//     if (!videoUrl) {
//       return NextResponse.json({ error: 'Video URL is required' }, { status: 400 })
//     }

//     await del(videoUrl)

//     return NextResponse.json({ success: true })
//   } catch (error) {
//     console.error('Delete video error:', error)
//     return NextResponse.json({ error: error.message }, { status: 500 })
//   }
// }


// app/api/delete-video/route.js
import { v2 as cloudinary } from 'cloudinary'
import { NextResponse } from 'next/server'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request) {
  try {
    const { videoUrl } = await request.json()
    if (!videoUrl) return NextResponse.json({ error: 'No URL' }, { status: 400 })

    // Extract public_id from Cloudinary URL
    // URL format: https://res.cloudinary.com/cloud_name/video/upload/v123/blog-videos/filename.mp4
    const matches = videoUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/)
    if (!matches) return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    const publicId = matches[1] // e.g. "blog-videos/filename"

    await cloudinary.uploader.destroy(publicId, { resource_type: 'video' })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Video delete error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
