import { getUserbyEmail } from "@/models/users";
import { NextResponse } from "next/server";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { cookies } from "next/headers";
export async function POST(req) {
    try {
            const {email,password,recaptchaToken } = await req.json()
      // 🛑 1. If a Python script calls this API, they won't have a token. Block them.
    if (!recaptchaToken) {
      return NextResponse.json(
        { error: "Security check failed. Automated bots are not allowed." },
        { status: 400 }
      )
    }
      // 🛑 2. Verify the token with Google
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;

    const recaptchaRes = await fetch(verifyUrl, { method: "POST" });
    const recaptchaData = await recaptchaRes.json();

    // 🛑 3. If Google says the score is too low, it's a bot. Block them.
    if (!recaptchaData.success || recaptchaData.score < 0.5) {
      console.warn("Bot login attempt blocked for email:", email);
      return NextResponse.json(
        { error: "Bot detected. Request blocked." }, 
        { status: 403 }
      );
    }
            const loginUser =  await getUserbyEmail(email)
          
            if(!loginUser){
                return NextResponse.json({
                    message:'Invalid Credentials',
                    status:401,
                    success:false
                })
            }
            const isPasswordCorrect = await bcrypt.compare(password,loginUser?.password)
            if(!isPasswordCorrect){
                 return NextResponse.json({
                    message:'Invalid Credentials',
                    status:401,
                    success:false
                })
            }
            const token = jwt.sign({id:loginUser.id,role:loginUser.role},process.env.SECRET_KEY,{expiresIn:"6h"})
            const cookiesStore = await cookies()
            cookiesStore.set("token",token,{
                httpOnly:true,
                sameSite:'strict',
                maxAge:6*60*50,
                secure:process.env.NODE_ENV === "production"
            })

            return NextResponse.json({
                message:'Login Successfully',
                role:loginUser.role,
                // message:`Welcome Back ${loginUser?.name}`,
                success:true,
                token:token,
                status:200
            })
        } catch (error) {
            console.log(error.message);
            return NextResponse.json({
                message:'Server error',
                status:500,
                success:false,
            })
        }
}