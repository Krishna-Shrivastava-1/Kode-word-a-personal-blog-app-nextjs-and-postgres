
import { createUser } from "@/models/users";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req,res) {
    try {
      const cookiesStore = await cookies()
      cookiesStore.set('token',"",{
        httpOnly:true,
        sameSite:'strict',
        expires:new Date(0),
        secure: process.env.NODE_ENV === 'production'
      })
       return NextResponse.json({ message: 'Logged out successfully', success: true });
    } catch (error) {
        console.log(error.message);
        return NextResponse.json({
            message:'Server error',
            status:500,
            success:false,
        })
    }
}