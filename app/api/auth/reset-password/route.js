import pool from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from 'bcrypt'

export async function PATCH(req) {
  try {
    const { email, password } = await req.json();

    // ⚠️ Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password required", success: false },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters", success: false },
        { status: 400 }
      );
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 14);

    // ✅ Update DB
    const result = await pool.query(
      `UPDATE users 
       SET password = $2 
       WHERE email = $1 
       RETURNING id`,
      [email, hashedPassword]
    );

    // ❌ User not found
    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "User not found", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Password updated successfully",
      success: true
    });

  } catch (error) {
    console.error("Reset error:", error);
    return NextResponse.json(
      { message: "Server error", success: false },
      { status: 500 }
    );
  }
}