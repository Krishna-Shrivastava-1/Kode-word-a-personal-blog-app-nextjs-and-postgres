import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req, res) {
    try {
        const getpublicpost = await pool.query(`
            SELECT p.*, u.name 
FROM posts p
JOIN users u ON p.user_id = u.id
WHERE p.public = TRUE
ORDER BY p.created_at DESC

            `)
        return NextResponse.json({
            message: 'All post which are public',
            publicpost: getpublicpost.rows,
            success: true
        })
    } catch (error) {
        console.error('Register error:', error.message);
        return NextResponse.json({
            message: 'Server error',
            success: false
        }, { status: 500 });
    }
}