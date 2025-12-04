
import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('image')

    if (!file) {
      return NextResponse.json({ error: 'No file' }, { status: 400 })
    }

    // Generate unique filename to avoid overwrites
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name.replace(/\s/g, '-')}`

    // Upload to Vercel Blob (in blog-posts folder)
    const blob = await put(filename, file, {
      access: 'public',
      folder: 'blog-posts',
      addRandomSuffix: true, // Adds random suffix to prevent collisions
    })

    console.log('✅ Uploaded:', blob.url)

    return NextResponse.json({ 
      url: blob.url,
      filename: filename 
    })

  } catch (error) {
    console.error('❌ Upload error:', error)
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 })
  }
}
