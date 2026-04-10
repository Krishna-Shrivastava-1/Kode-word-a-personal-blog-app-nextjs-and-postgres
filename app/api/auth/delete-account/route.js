// import pool from '@/lib/db'
// import { Authorized } from '@/controllers/authControl'
// import { cookies } from 'next/headers'

// export async function DELETE(req) {
//   try {
//     const authUser = await Authorized()
//     if (!authUser?.user) {
//       return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
//         status: 401 
//       })
//     }

//     const userId = authUser.user.id

//     // Delete user (CASCADE will delete bookmarks, likes, etc.)
//     await pool.query('DELETE FROM users WHERE id = $1', [userId])
//  const cookiesStore = await cookies()
//       cookiesStore.set('token',"",{
//         httpOnly:true,
//         sameSite:'strict',
//         expires:new Date(0),
//         secure: process.env.NODE_ENV === 'production'
//       })
//     return new Response(
//       JSON.stringify({ success: true, message: 'Account deleted' }), 
//       { status: 200 }
//     )

//   } catch (error) {
//     console.error('Delete account error:', error)
//     return new Response(
//       JSON.stringify({ error: 'Failed to delete account' }), 
//       { status: 500 }
//     )
//   }
// }



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

    // 🧹 STEP 1: Delete dependent data FIRST
    await pool.query('DELETE FROM post_likes WHERE user_id = $1', [userId])
    await pool.query('DELETE FROM bookmark_user WHERE user_id = $1', [userId])

    // (add more if you have)
    // await pool.query('DELETE FROM comments WHERE user_id = $1', [userId])

    // 👤 STEP 2: Delete user
    await pool.query('DELETE FROM users WHERE id = $1', [userId])

    // 🍪 Clear cookie
    const cookiesStore = await cookies()
    cookiesStore.set('token', "", {
      httpOnly: true,
      sameSite: 'strict',
      expires: new Date(0),
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