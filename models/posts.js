import pool from "@/lib/db";

export async function createPost(title,content,userid,tag,thumbnailImage,subTitle) {
    try {
        const result = await pool.query(`
           INSERT INTO posts (title,content,user_id,tag,thumbnailImage,subTitle)
           VALUES ($1,$2,$3,$4,$5,$6)
           RETURNING title,id,content,views,created_at,user_id,tag,thumbnailImage,subTitle
            `, [title,content,userid,tag,thumbnailImage,subTitle])
        return result.rows[0];
    } catch (error) {
        console.log(error.message)
        throw error;
    }
}

export async function getPostbyId(id) {
       try {
        const result = await pool.query(`
            Select title,tag,content,thumbnailImage,subTitle,created_at from posts where id = $1
            `, [id])
        return result.rows[0];
    } catch (error) {
        console.log(error.message)
        throw error;
    }
}

export async function getAllPosts() {
    try {
        const result = await pool.query(`
            SELECT p.id,p.title,p.content,p.user_id,p.tag,p.thumbnailImage,p.subTitle,p.created_at,p.views ,p.public, 
            u.name
            FROM posts p
            JOIN users u ON user_id = u.id
            ORDER BY created_at DESC
            `)
        return result.rows
    } catch (error) {
        console.log(error.message);
        throw error;
    }
}
export async function updatePost(title,content,id,thumbnailImage,subTitle) {
    try {
        const result = await pool.query(`
            UPDATE posts 
            SET title = $1,
                content = $2,
                thumbnailImage = $3
                subTitle = $4
            WHERE id = $5
            RETURNING id,title,content,thumbnailImage,public
            `,[title, content, thumbnailImage,subTitle,id])
        return result.rows[0]
    } catch (error) {
        console.log(error.message);
        throw error;
    }
}

export async function updatePostVisibility(postId,postVisiblity) {
    try {
        const result = await pool.query(`
            Update posts
            SET public =$1
            WHERE id = $2
            RETURNING id,title,content,thumbnailImage,public
            `,[postVisiblity,postId])
            return result.rows
    } catch (error) {
        console.log(error.message)
        throw error
    }
}