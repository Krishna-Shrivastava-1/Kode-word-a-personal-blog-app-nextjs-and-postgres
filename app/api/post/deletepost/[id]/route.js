// import pool from '@/lib/db'
// import { Authorized } from '@/controllers/authControl'
// import { del } from '@vercel/blob'

// export async function DELETE(req, { params }) {
//   try {
//     // 1. Check if user is authenticated
//     const authUser = await Authorized()
//     if (!authUser?.user) {
//       return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
//         status: 401 
//       })
//     }

//     // 2. CHECK IF USER IS ADMIN
//     if (authUser.user.role !== 'admin') {
//       return new Response(
//         JSON.stringify({ error: 'Forbidden: Admin access only' }), 
//         { status: 403 }
//       )
//     }

//     const { id } = await params

//     // 3. Get post details (for images)
//     const postResult = await pool.query(
//       'SELECT content, thumbnailimage,slug FROM posts WHERE id = $1',
//       [id]
//     )

//     if (postResult.rows.length === 0) {
//       return new Response(JSON.stringify({ error: 'Post not found' }), { 
//         status: 404 
//       })
//     }

//     const post = postResult.rows[0]

//     // 4. Extract all image URLs
//     const imageUrls = []
    
//     // Add thumbnail
//     if (post.thumbnailimage) {
//       imageUrls.push(post.thumbnailimage)
//     }

//     // Extract images from content
//     if (post.content) {
//       const imgRegex = /<img[^>]+src="([^">]+)"/g
//       let match
//       while ((match = imgRegex.exec(post.content)) !== null) {
//         imageUrls.push(match[1])
//       }
//     }

//     // 5. Delete images from storage (inline logic)
//     let deletedCount = 0
//     for (const imageUrl of imageUrls) {
//       try {
//         // Skip external images
//         if (!imageUrl.includes('blob.vercel-storage.com')) {
//           console.log('Skipped external image:', imageUrl)
//           continue
//         }

//         // Delete from Vercel Blob
//         await del(imageUrl)
//         deletedCount++
//         console.log('Deleted:', imageUrl)
//       } catch (error) {
//         console.error('Failed to delete image:', imageUrl, error)
//       }
//     }

// const resp = await fetch(
//   `${process.env.DELETEEMBEDINGOFBLOG}/${post.slug}`,
//   { method: "DELETE" }
// )

//   const data = await resp.json()
//   // console.log(data)
//     // 6. Delete post (CASCADE deletes bookmarks & likes)
//     await pool.query('DELETE FROM posts WHERE id = $1', [id])

//     return new Response(
//       JSON.stringify({ 
//         success: true, 
//         message: 'Post deleted successfully',
//         totalImages: imageUrls.length,
//         deletedImages: deletedCount
//       }), 
//       { status: 200 }
//     )

//   } catch (error) {
//     console.error('Delete post error:', error)
//     return new Response(
//       JSON.stringify({ error: 'Failed to delete post' }), 
//       { status: 500 }
//     )
//   }
// }


// app/api/post/delete/[id]/route.js  (or wherever your DELETE route lives)
// app/api/post/delete/[id]/route.js  (or wherever your DELETE route lives)
// import pool from '@/lib/db'
// import { Authorized } from '@/controllers/authControl'
// import { del } from '@vercel/blob'

// export async function DELETE(req, { params }) {
//   try {
//     const authUser = await Authorized()
//     if (!authUser?.user) {
//       return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
//     }

//     if (authUser.user.role !== 'admin') {
//       return new Response(JSON.stringify({ error: 'Forbidden: Admin access only' }), { status: 403 })
//     }

//     const { id } = await params

//     const postResult = await pool.query(
//       'SELECT content, thumbnailimage, slug FROM posts WHERE id = $1',
//       [id]
//     )

//     if (postResult.rows.length === 0) {
//       return new Response(JSON.stringify({ error: 'Post not found' }), { status: 404 })
//     }

//     const post = postResult.rows[0]

//     // ── Collect all Vercel Blob URLs to delete ────────────────────────────────
//     const blobUrls = []

//     // Thumbnail
//     if (post.thumbnailimage && post.thumbnailimage.includes('blob.vercel-storage.com')) {
//       blobUrls.push(post.thumbnailimage)
//     }

//     if (post.content) {
//       // Extract image URLs from content
//       const imgRegex = /<img[^>]+src="([^">]+)"/g
//       let match
//       while ((match = imgRegex.exec(post.content)) !== null) {
//         if (match[1].includes('blob.vercel-storage.com')) {
//           blobUrls.push(match[1])
//         }
//       }

//       // ✅ Extract video URLs — stored in data-video-src on .ql-video-wrapper divs
//       // NOT in <iframe src> — custom VideoBlot uses div wrapper
//       const videoRegex = /data-video-src="([^"]+)"/g
//       while ((match = videoRegex.exec(post.content)) !== null) {
//         const src = match[1]
//         if (
//           src.includes('blob.vercel-storage.com') ||
//            src.includes('res.cloudinary.com') || 
//           src.match(/\.(mp4|webm|mov)(\?|$)/i)
//         ) {
//           blobUrls.push(src)
//         }
//       }

//       // Also catch old-style iframe embeds (legacy posts before VideoBlot)
//       const iframeRegex = /<iframe[^>]+src="([^">]+)"/g
//       while ((match = iframeRegex.exec(post.content)) !== null) {
//         const src = match[1]
//         if (
//           src.includes('blob.vercel-storage.com') ||
//           src.match(/\.(mp4|webm|mov)(\?|$)/i)
//         ) {
//           if (!blobUrls.includes(src)) blobUrls.push(src)
//         }
//       }
//     }

//     // ── Delete all blob assets ────────────────────────────────────────────────
//     let deletedCount = 0
//     for (const url of blobUrls) {
//       try {
//         await del(url)
//         deletedCount++
//         console.log('✅ Deleted from blob:', url)
//       } catch (error) {
//         console.error('❌ Failed to delete:', url, error)
//       }
//     }

//     // ── Delete embedding ──────────────────────────────────────────────────────
//     const resp = await fetch(
//       `${process.env.DELETEEMBEDINGOFBLOG}/${post.slug}`,
//       { method: 'DELETE' }
//     )
//     const data = await resp.json()

//     // ── Delete post from DB (CASCADE deletes bookmarks & likes) ──────────────
//     await pool.query('DELETE FROM posts WHERE id = $1', [id])

//     return new Response(
//       JSON.stringify({
//         success: true,
//         message: 'Post deleted successfully',
//         totalAssets: blobUrls.length,
//         deletedAssets: deletedCount,
//       }),
//       { status: 200 }
//     )
//   } catch (error) {
//     console.error('Delete post error:', error)
//     return new Response(JSON.stringify({ error: 'Failed to delete post' }), { status: 500 })
//   }
// }



import pool from '@/lib/db'
import { Authorized } from '@/controllers/authControl'
import { del } from '@vercel/blob'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// ─── Delete a single asset from the correct storage ───────────────────────────
async function deleteAsset(url) {
  if (!url) return

  if (url.includes('res.cloudinary.com')) {
    // Extract public_id from Cloudinary URL
    // Format: https://res.cloudinary.com/cloud/video/upload/v123/blog-videos/filename.mp4
    const matches = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/)
    if (!matches) {
      console.error('❌ Could not extract Cloudinary public_id from:', url)
      return
    }
    const publicId = matches[1] // e.g. "blog-videos/my-video"
    const resourceType = url.includes('/video/') ? 'video' : 'image'
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
    console.log('✅ Deleted from Cloudinary:', publicId)
  } else if (url.includes('blob.vercel-storage.com')) {
    await del(url)
    console.log('✅ Deleted from Vercel Blob:', url)
  }
}

export async function DELETE(req, { params }) {
  try {
    const authUser = await Authorized()
    if (!authUser?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    if (authUser.user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access only' }), { status: 403 })
    }

    const { id } = await params

    const postResult = await pool.query(
      'SELECT content, thumbnailimage, slug FROM posts WHERE id = $1',
      [id]
    )

    if (postResult.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Post not found' }), { status: 404 })
    }

    const post = postResult.rows[0]

    // ── Collect all storage URLs ───────────────────────────────────────────────
    const assetUrls = []

    const isStorageUrl = (url) =>
      url.includes('blob.vercel-storage.com') ||
      url.includes('res.cloudinary.com') ||
      url.match(/\.(mp4|webm|mov)(\?|$)/i)

    // Thumbnail
    if (post.thumbnailimage && isStorageUrl(post.thumbnailimage)) {
      assetUrls.push(post.thumbnailimage)
    }

    if (post.content) {
      let match

      // Images
      const imgRegex = /<img[^>]+src="([^">]+)"/g
      while ((match = imgRegex.exec(post.content)) !== null) {
        if (isStorageUrl(match[1])) assetUrls.push(match[1])
      }

      // Videos — new format (ql-video-wrapper with data-video-src)
      const videoRegex = /data-video-src="([^"]+)"/g
      while ((match = videoRegex.exec(post.content)) !== null) {
        if (isStorageUrl(match[1])) assetUrls.push(match[1])
      }

      // Videos — legacy format (iframe src for old posts)
      const iframeRegex = /<iframe[^>]+src="([^">]+)"/g
      while ((match = iframeRegex.exec(post.content)) !== null) {
        if (isStorageUrl(match[1]) && !assetUrls.includes(match[1])) {
          assetUrls.push(match[1])
        }
      }
    }

    // ── Delete each asset from correct storage ────────────────────────────────
    let deletedCount = 0
    for (const url of assetUrls) {
      try {
        await deleteAsset(url)
        deletedCount++
      } catch (error) {
        console.error('❌ Failed to delete:', url, error)
      }
    }

    // ── Delete embedding ──────────────────────────────────────────────────────
    const resp = await fetch(
      `${process.env.DELETEEMBEDINGOFBLOG}/${post.slug}`,
      { method: 'DELETE' }
    )
    await resp.json()

    // ── Delete post from DB (CASCADE deletes bookmarks & likes) ──────────────
    await pool.query('DELETE FROM posts WHERE id = $1', [id])

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Post deleted successfully',
        totalAssets: assetUrls.length,
        deletedAssets: deletedCount,
      }),
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete post error:', error)
    return new Response(JSON.stringify({ error: 'Failed to delete post' }), { status: 500 })
  }
}