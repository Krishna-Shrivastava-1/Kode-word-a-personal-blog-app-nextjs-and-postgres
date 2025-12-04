import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req, {params}) {
    try {
        const {id} = await params
        const getpublicpost = await pool.query(`
            SELECT p.*, u.name 
FROM posts p
JOIN users u ON p.user_id = u.id
WHERE p.public = TRUE AND p.id = $1
ORDER BY p.created_at DESC

            `,[id])
        return NextResponse.json({
            message: ' post which are public by id',
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