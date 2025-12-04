import { sendOTPEmail } from "@/controllers/VerifyEmail";
import { getUserbyEmail } from "@/models/users";
import { storeTempUser } from "@/models/verifyEmail";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();
    
    // ✅ STEP 1: Check if user exists
    const checkUser = await getUserbyEmail(email);
    if (checkUser) {
      return NextResponse.json({
        message: 'Invalid Credentials',
        success: false
      }, { status: 409 });
    }
    
    // ✅ STEP 2: Store temp registration data (name, email, password)
    await storeTempUser(name, email, password);
    
    // ✅ STEP 3: Send OTP email
    const sendOtp = await sendOTPEmail(email, name);
    
    if (!sendOtp.success) {
      return NextResponse.json({
        message: "Failed to send OTP. Please try again.",
        success: false
      }, { status: 500 });
    }
    
    // ✅ SUCCESS: OTP sent, waiting for verification
    return NextResponse.json({
      message: 'OTP sent! Check your inbox.',
      success: true,
      requiresOTP: true  // Frontend shows OTP input
    });
    
  } catch (error) {
    console.error('Register error:', error.message);
    return NextResponse.json({
      message: 'Server error',
      success: false
    }, { status: 500 });
  }
}
