import pool from '@/lib/db'
import jwt from 'jsonwebtoken'

import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    
    if (!code) {
      return new Response('No code', { status: 400 })
    }
    
    // 1. Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.BASE_URL}/api/auth/google-callback`,
        grant_type: 'authorization_code'
      })
    })
    
    const tokens = await tokenRes.json()
    
    // 2. Get user info from Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    })
    
    const googleUser = await userRes.json()
    // console.log(googleUser)
    // 3. Check if user exists
    let dbUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [googleUser.email]
    )
    
    if (dbUser.rows.length === 0) {
      // 4. Create new user (NO PASSWORD)
      dbUser = await pool.query(
        `INSERT INTO users (email, name, image,password, provider) 
         VALUES ($1, $2, $3,$4, 'google') RETURNING *`,
        [googleUser.email, googleUser.name, googleUser.picture,process.env.RANDOM_CRED]
      )
    }
    
    // 5. Generate JWT
    const token = jwt.sign(
      { id: dbUser.rows[0].id, role: dbUser.rows[0].role },
      process.env.SECRET_KEY,
      { expiresIn: '6h' }
    )
    
    // 6. Set cookie and redirect
       const response = NextResponse.redirect(new URL('/', req.url))
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 21600
    })
    
    return response
 
    
  } catch (error) {
    console.error(error)
    return new Response('Auth failed', { status: 500 })
  }
}
