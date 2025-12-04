import pool from '@/lib/db'
import { Authorized } from '@/controllers/authControl'

export async function PATCH(req) {
  try {
    // Check authentication
    const authUser = await Authorized()
    if (!authUser?.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401 }
      )
    }

    const { name } = await req.json()

    // Validate name
    if (!name || !name.trim()) {
      return new Response(
        JSON.stringify({ error: 'Name is required' }), 
        { status: 400 }
      )
    }

    if (name.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: 'Name must be at least 2 characters' }), 
        { status: 400 }
      )
    }

    if (name.trim().length > 50) {
      return new Response(
        JSON.stringify({ error: 'Name must be less than 50 characters' }), 
        { status: 400 }
      )
    }

    // Update name
    await pool.query(
      'UPDATE users SET name = $1 WHERE id = $2',
      [name.trim(), authUser.user.id]
    )

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Name updated successfully' 
      }), 
      { status: 200 }
    )

  } catch (error) {
    console.error('Update name error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to update name' }), 
      { status: 500 }
    )
  }
}
