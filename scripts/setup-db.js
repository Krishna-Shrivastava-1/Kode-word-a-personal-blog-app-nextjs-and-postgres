import 'dotenv/config';
import pool from '../lib/db.js';

async function setupDatabase() {
  try {
    console.log('🚀 Creating UUID schema...');

    // 1. ENABLE UUID EXTENSION (One-time)
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // 2. USERS (UUID)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        image VARCHAR(255),
        password VARCHAR(255) ,
         provider VARCHAR DEFAULT 'credentials',
        role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
// await pool.query(`
//   ALTER TABLE users ADD COLUMN provider VARCHAR DEFAULT 'credentials'
//   `)
    // 3. POSTS (UUID)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        thumbnailImage VARCHAR(255) NOT NULL,
        tag VARCHAR(255) NOT NULL,
        subTitle VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        public BOOLEAN NOT NULL DEFAULT FALSE,
        user_id UUID REFERENCES users(id),
        views INTEGER DEFAULT 0,
        tsv tsvector GENERATED ALWAYS AS(
        to_tsvector('english',
        coalesce(title,'')||' '||
         coalesce(subTitle, '') || ' ' || 
        coalesce(tag, '') || ' ' || 
        coalesce(content, '')
        )
        )STORED,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
// await pool.query(`
//   ALTER TABLE posts
//   ADD COLUMN tsv tsvector 
//   GENERATED ALWAYS AS (
//     to_tsvector('english', 
//       coalesce(title, '') || ' ' || 
//       coalesce(subTitle, '') || ' ' || 
//       coalesce(tag, '') || ' ' || 
//       coalesce(content, '')
//     )
//   ) STORED
// `);
//   await pool.query(`
//   CREATE INDEX posts_tsv_idx ON posts USING GIN(tsv)
// `);
    // 4. COMMENTS (UUID)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        post_id UUID REFERENCES posts(id),
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 5. POST_LIKES (UUID)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS post_likes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, post_id)
      )
    `);
    // BookMark Table
    await pool.query(`
  CREATE TABLE IF NOT EXISTS bookmark_user(
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
   post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, post_id)
  )
  `)
//   await pool.query(`
//   ALTER TABLE post_likes 
//     DROP CONSTRAINT IF EXISTS post_likes_post_id_fkey;

//   ALTER TABLE post_likes 
//     ADD CONSTRAINT post_likes_post_id_fkey 
//     FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;

//   ALTER TABLE bookmark_user 
//     DROP CONSTRAINT IF EXISTS bookmark_user_post_id_fkey;

//   ALTER TABLE bookmark_user 
//     ADD CONSTRAINT bookmark_user_post_id_fkey 
//     FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;
// `)

    // 6. TEMP_USERS (Stores registration data before OTP verification)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS temp_users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '10 minutes'
      )
    `);

    // 7. VERIFY_USER (Stores OTPs for email verification)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS verify_user (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '5 minutes'
      )
    `);

    // 8. INDEXES for performance (speeds up OTP lookups)
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_verify_user_email ON verify_user(email);
      CREATE INDEX IF NOT EXISTS idx_verify_user_expires ON verify_user(expires_at);
      CREATE INDEX IF NOT EXISTS idx_temp_users_email ON temp_users(email);
      CREATE INDEX IF NOT EXISTS idx_temp_users_expires ON temp_users(expires_at);
    `);

    console.log('✅ ALL UUID TABLES created!');

    // Verify tables
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('📋 Tables:', tables.rows.map(t => t.table_name).join(', '));

  } catch (error) {
    console.error('❌ Schema Error:', error.message);
  }
}

setupDatabase();
