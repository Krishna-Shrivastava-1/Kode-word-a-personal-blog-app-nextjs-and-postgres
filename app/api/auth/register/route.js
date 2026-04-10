import { sendOTPEmail } from "@/controllers/VerifyEmail";
import { getUserbyEmail } from "@/models/users";
import { storeTempUser } from "@/models/verifyEmail";
import { NextResponse } from "next/server";
const normalizeEmail = (email) => {
  if (!email || !email.includes('@')) return email;

  let [user, domain] = email.toLowerCase().trim().split('@');

  // We only apply "dot" and "plus" rules to Gmail
  // Note: Outlook and others use '+' too, but Gmail is the primary focus for '.'
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    // 1. Remove everything after '+'
    user = user.split('+')[0];
    // 2. Remove all dots
    user = user.replace(/\./g, '');
  }

  return `${user}@${domain}`;
};
export async function POST(req) {
  try {
    const { name, email, password,recaptchaToken } = await req.json();
      // 🛑 1. If a Python script calls this API, they won't have a token. Block them.
      const safeEmail = normalizeEmail(email);
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
    const abstractKey = process.env.ABSTRACT_API_KEY;
    const abstractUrl = `https://emailvalidation.abstractapi.com/v1/?api_key=${abstractKey}&email=${email}`;
    
    const verifyRes = await fetch(abstractUrl);
    const verifyData = await verifyRes.json();

    // Map the V2 JSON structure you shared
    const isDisposable = verifyData.email_quality?.is_disposable;
    const isDeliverable = verifyData.email_deliverability?.status === "deliverable";
    const qualityScore = verifyData.email_quality?.score;

    if (isDisposable || !isDeliverable || qualityScore < 0.6) {
      return NextResponse.json(
        { error: "This email provider is not allowed. Please use a permanent email." },
        { status: 403 }
      );
    }
    // ✅ STEP 1: Check if user exists
    const checkUser = await getUserbyEmail(safeEmail);
    if (checkUser) {
      return NextResponse.json({
        message: 'Invalid Credentials',
        success: false
      }, { status: 409 });
    }
    
    // ✅ STEP 2: Store temp registration data (name, email, password)
    await storeTempUser(name, safeEmail, password);
    
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
