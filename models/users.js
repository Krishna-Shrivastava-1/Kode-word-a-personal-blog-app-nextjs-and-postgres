import pool from '@/lib/db';
import bcrypt from 'bcrypt'
export async function createUser(name, email, password) {
    const hashedPassword = await bcrypt.hash(password, 14);
    const result = await pool.query(`
        INSERT INTO users (name,email,password,role)
        VALUES ($1,$2,$3,$4)
        RETURNING id, name,email,email,role,created_at
        `, [name, email, hashedPassword, 'user']);
    return result.rows[0];
}

export async function getAllUser() {
    try {
        const result = await pool.query(`
            SELECT name,email,role,created_at,id FROM users
            ORDER BY created_at ASC
            `)
        return result.rows
    } catch (error) {
        console.log(error.message);
        throw error;
    }
}

export async function getUserbyID(id) {
    try {
        const result = await pool.query(`
      SELECT 
                u.id,
                u.name,
                u.email,
                u.created_at,
                u.role,
                u.image,
                COALESCE(
                    (SELECT COUNT(*) FROM bookmark_user WHERE user_id = u.id), 
                    0
                ) AS bookmark_count
            FROM users u
            WHERE u.id = $1
            `, [id])
        return result.rows[0];
    } catch (error) {
        console.log(error.message)
        throw error;
    }
}
export async function getUserbyEmail(email) {
    try {
        const result = await pool.query(`
            Select id,email,role,password from users where email = $1
            `, [email])
        return result.rows[0];
    } catch (error) {
        console.log(error.message)
        throw error;
    }
}