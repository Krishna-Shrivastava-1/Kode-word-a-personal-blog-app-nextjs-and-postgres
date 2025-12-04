import pool from '@/lib/db'
import { Authorized } from '@/controllers/authControl'
import { del } from '@vercel/blob'

export async function DELETE(req, { params }) {
  try {
    // 1. Check if user is authenticated
    const authUser = await Authorized()
    if (!authUser?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401 
      })
    }

    // 2. CHECK IF USER IS ADMIN
    if (authUser.user.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access only' }), 
        { status: 403 }
      )
    }

    const { id } = await params

    // 3. Get post details (for images)
    const postResult = await pool.query(
      'SELECT content, thumbnailimage FROM posts WHERE id = $1',
      [id]
    )

    if (postResult.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Post not found' }), { 
        status: 404 
      })
    }

    const post = postResult.rows[0]

    // 4. Extract all image URLs
    const imageUrls = []
    
    // Add thumbnail
    if (post.thumbnailimage) {
      imageUrls.push(post.thumbnailimage)
    }

    // Extract images from content
    if (post.content) {
      const imgRegex = /<img[^>]+src="([^">]+)"/g
      let match
      while ((match = imgRegex.exec(post.content)) !== null) {
        imageUrls.push(match[1])
      }
    }

    // 5. Delete images from storage (inline logic)
    let deletedCount = 0
    for (const imageUrl of imageUrls) {
      try {
        // Skip external images
        if (!imageUrl.includes('blob.vercel-storage.com')) {
          console.log('Skipped external image:', imageUrl)
          continue
        }

        // Delete from Vercel Blob
        await del(imageUrl)
        deletedCount++
        console.log('Deleted:', imageUrl)
      } catch (error) {
        console.error('Failed to delete image:', imageUrl, error)
      }
    }

    // 6. Delete post (CASCADE deletes bookmarks & likes)
    await pool.query('DELETE FROM posts WHERE id = $1', [id])

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Post deleted successfully',
        totalImages: imageUrls.length,
        deletedImages: deletedCount
      }), 
      { status: 200 }
    )

  } catch (error) {
    console.error('Delete post error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to delete post' }), 
      { status: 500 }
    )
  }
}
