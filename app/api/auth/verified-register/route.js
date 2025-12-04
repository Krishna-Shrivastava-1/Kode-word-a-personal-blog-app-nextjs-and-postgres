import { createUser } from "@/models/users";
import { checkOTP, getTempUser, deleteTempUser } from "@/models/verifyEmail";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, otp } = await req.json();
    
    // ✅ Validation
    if (!email || !otp) {
      return NextResponse.json({
        message: 'Email and OTP are required',
        success: false
      }, { status: 400 });
    }

    // ✅ Verify OTP
    const otpCheck = await checkOTP(email, otp);
    if (!otpCheck.valid) {
      return NextResponse.json({
        message: 'Invalid or expired OTP. Please try again or request a new code.',
        success: false
      }, { status: 400 });  // ✅ 400 with clear message
    }

    // ✅ Get temp user data
    const tempUser = await getTempUser(email);
    if (!tempUser) {
      return NextResponse.json({
        message: 'Registration expired. Please register again.',
        success: false
      }, { status: 404 });
    }

    // ✅ Create user
    const newUser = await createUser(tempUser.name, tempUser.email, tempUser.password);
    
    // ✅ Cleanup
    await deleteTempUser(email);

    return NextResponse.json({
      message: 'Account created successfully!',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
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
