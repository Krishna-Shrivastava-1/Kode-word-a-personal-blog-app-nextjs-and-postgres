import { checkOTP } from "@/models/verifyEmail";
import { NextResponse } from "next/server";

export async function POST(req,res) {
    try {
        const {email ,otp}  = await req.json();
        if(!otp){
            return NextResponse.json({
                message:'OTP is required',
                success:false
            })
        }
          const otpCheck = await checkOTP(email, otp);
            if (!otpCheck.valid) {
              return NextResponse.json({
                message: 'Invalid or expired OTP. Please try again or request a new code.',
                success: false
              }, { status: 400 });  // ✅ 400 with clear message
            }
              return NextResponse.json({
      message: 'OTP Verified',
      status:200,
      success: true
    });
    } catch (error) {
          console.error('Verify OTP error:', error);
            return NextResponse.json({
              message: 'Server error. Please try again.',
              success: false
            }, { status: 500 });
    }
}