import { sendOTPEmail } from "@/controllers/VerifyEmail";
import { getUserbyEmail } from "@/models/users";
import { NextResponse } from "next/server";
const normalizeEmail = (email) => {
  if (!email || !email.includes("@")) return email;

  let [user, domain] = email.toLowerCase().trim().split("@");

  if (domain === "gmail.com" || domain === "googlemail.com") {
    user = user.split("+")[0];
    user = user.replace(/\./g, "");
  }

  return `${user}@${domain}`;
};
export async function POST(req) {
    try {
        const {email,recaptchaToken}  = await req.json();
const safeEmail = normalizeEmail(email);
 const domain = safeEmail.split("@")[1];

    // 🛡️ STEP 1: Domain whitelist (STRONGEST FILTER)
    const allowedDomains = [
      "gmail.com",
      "yahoo.com",
      "outlook.com",
      "hotmail.com",
      "icloud.com"
    ];

    if (!allowedDomains.includes(domain)) {
      return NextResponse.json(
        { error: "Use a trusted email provider." },
        { status: 403 }
      );
    }
 // ✅ 2. If no token is provided, block the request instantly
    if (!recaptchaToken) {
      return NextResponse.json(
        { error: "Security check failed. Please refresh and try again." },
        { status: 400 }
      )
    }

    // ✅ 3. Send the token to Google to verify
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;

    const recaptchaRes = await fetch(verifyUrl, { method: "POST" });
    const recaptchaData = await recaptchaRes.json();

    // ✅ 4. Check the score! (0.0 is a bot, 1.0 is a human)
    // 0.5 is a standard safe threshold.
    if (!recaptchaData.success || recaptchaData.score < 0.5) {
      console.warn("Bot detected in Chat API:", recaptchaData);
      return NextResponse.json(
        { error: "Bot detected. Request blocked." }, 
        { status: 403 }
      );
    }
    // 🛡️ STEP 2: Abstract API (secondary check)
    const abstractKey = process.env.ABSTRACT_API_KEY;

    const abstractUrl = `https://emailvalidation.abstractapi.com/v1/?api_key=${abstractKey}&email=${safeEmail}`;

    const verifyRes = await fetch(abstractUrl);
    const verifyData = await verifyRes.json();

    // console.log("Abstract response:", verifyData);

    const isDisposable = verifyData.is_disposable_email?.value === true;
    const deliverability = verifyData.deliverability; // DELIVERABLE, UNDELIVERABLE, UNKNOWN

    if (isDisposable) {
      return NextResponse.json(
        { error: "Disposable email not allowed." },
        { status: 403 }
      );
    }

    if (deliverability === "UNDELIVERABLE") {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 403 }
      );
    }

    // ✅ STEP 3: Check existing user
 
    const checkUser = await getUserbyEmail(safeEmail);
    if (!checkUser) {
      return NextResponse.json(
        {
          message: "Invalid Email",
          success: false
        },
        { status: 409 }
      );
    }

      const sendOtp = await sendOTPEmail(safeEmail);
    
        if (!sendOtp.success) {
          return NextResponse.json(
            {
              message: "Failed to send OTP. Try Again Later",
              success: false
            },
            { status: 500 }
          );
        }
 return NextResponse.json({
      message: "OTP sent successfully",
      success: true,
      requiresOTP: true
    });

    } catch (error) {
          console.error("Register error:", error);
            return NextResponse.json(
              {
                message: "Server error",
                success: false
              },
              { status: 500 }
            );
    }
}