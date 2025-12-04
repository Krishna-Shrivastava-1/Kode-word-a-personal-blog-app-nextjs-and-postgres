import pool from '@/lib/db'
import { Authorized } from '@/controllers/authControl'
import { cookies } from 'next/headers'

export async function DELETE(req) {
  try {
    const authUser = await Authorized()
    if (!authUser?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401 
      })
    }

    const userId = authUser.user.id

    // Delete user (CASCADE will delete bookmarks, likes, etc.)
    await pool.query('DELETE FROM users WHERE id = $1', [userId])
 const cookiesStore = await cookies()
      cookiesStore.set('token',"",{
        httpOnly:true,
        sameSite:'strict',
        expires:new Date(0),
        secure: process.env.NODE_ENV === 'production'
      })
    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted' }), 
      { status: 200 }
    )

  } catch (error) {
    console.error('Delete account error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to delete account' }), 
      { status: 500 }
    )
  }
}
