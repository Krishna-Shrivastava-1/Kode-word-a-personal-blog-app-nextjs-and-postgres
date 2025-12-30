
-- // User Schema
 CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user','admin')),
        created_at TIMESTAMP DEFAULT NOW()
      )

-- // Blogs Schema 
 CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        views INTEGER DEFAULT 0,
        image_urls TEXT[],
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
        
      )

-- // Comments
 CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        post_id INTEGER REFERENCES posts(id),
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )

CREATE TABLE IF NOT EXISTS post_likes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        post_id INTEGER REFERENCES posts(id),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, post_id)
      )