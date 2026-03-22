// // app/api/upload-video/route.js
// import { put } from '@vercel/blob'
// import { NextResponse } from 'next/server'

// export async function POST(request) {
//   try {
//     const formData = await request.formData()
//     const file = formData.get('video')

//     if (!file) {
//       return NextResponse.json({ error: 'No file' }, { status: 400 })
//     }

//     const timestamp = Date.now()
//     const filename = `${timestamp}-${file.name.replace(/\s/g, '-')}`

//     const blob = await put(filename, file, {
//       access: 'public',
//       folder: 'blog-videos',
//       addRandomSuffix: true,
//     })

//     console.log('✅ Video uploaded:', blob.url)

//     return NextResponse.json({
//       url: blob.url,
//       filename: filename,
//     })
//   } catch (error) {
//     console.error('❌ Video upload error:', error)
//     return NextResponse.json({ error: error.message }, { status: 500 })
//   }
// }



// app/api/upload-video/route.js
import { v2 as cloudinary } from 'cloudinary'
import { NextResponse } from 'next/server'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('video')
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'blog-videos',
          // Restrict access — no download button in browser
          access_mode: 'public',
        },
        (error, result) => error ? reject(error) : resolve(result)
      ).end(buffer)
    })

    return NextResponse.json({ url: result.secure_url })
  } catch (error) {
    console.error('Video upload error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}