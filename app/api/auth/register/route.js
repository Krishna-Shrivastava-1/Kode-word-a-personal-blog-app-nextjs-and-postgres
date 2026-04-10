// import { sendOTPEmail } from "@/controllers/VerifyEmail";
// import { getUserbyEmail } from "@/models/users";
// import { storeTempUser } from "@/models/verifyEmail";
// import { NextResponse } from "next/server";
// const normalizeEmail = (email) => {
//   if (!email || !email.includes('@')) return email;

//   let [user, domain] = email.toLowerCase().trim().split('@');

//   // We only apply "dot" and "plus" rules to Gmail
//   // Note: Outlook and others use '+' too, but Gmail is the primary focus for '.'
//   if (domain === 'gmail.com' || domain === 'googlemail.com') {
//     // 1. Remove everything after '+'
//     user = user.split('+')[0];
//     // 2. Remove all dots
//     user = user.replace(/\./g, '');
//   }

//   return `${user}@${domain}`;
// };
// export async function POST(req) {
//   try {
//     const { name, email, password,recaptchaToken } = await req.json();
//       // 🛑 1. If a Python script calls this API, they won't have a token. Block them.
//       const safeEmail = normalizeEmail(email);
//     if (!recaptchaToken) {
//       return NextResponse.json(
//         { error: "Security check failed. Automated bots are not allowed." },
//         { status: 400 }
//       )
//     }
//       // 🛑 2. Verify the token with Google
//     const secretKey = process.env.RECAPTCHA_SECRET_KEY;
//     const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;

//     const recaptchaRes = await fetch(verifyUrl, { method: "POST" });
//     const recaptchaData = await recaptchaRes.json();

//     // 🛑 3. If Google says the score is too low, it's a bot. Block them.
//     if (!recaptchaData.success || recaptchaData.score < 0.5) {
//       console.warn("Bot login attempt blocked for email:", email);
//       return NextResponse.json(
//         { error: "Bot detected. Request blocked." }, 
//         { status: 403 }
//       );
//     }
//     console.log("Recaptcha:", recaptchaData);
//    const abstractKey = process.env.ABSTRACT_API_KEY;

// // ✅ Always use normalized email
// const abstractUrl = `https://emailreputation.abstractapi.com/v1/?api_key=${abstractKey}&email=${email}`;

// const verifyRes = await fetch(abstractUrl);
// const verifyData = await verifyRes.json();

// // ✅ Correct fields (based on real API)
// const isDisposable = verifyData.is_disposable_email === true;
// const deliverability = verifyData.deliverability; // DELIVERABLE, UNDELIVERABLE, RISKY, UNKNOWN

// // 🛡️ Improved logic
// if (isDisposable) {
//   return NextResponse.json(
//     { error: "Disposable email addresses are not allowed." },
//     { status: 403 }
//   );
// }

// // ❗ Only block clearly bad emails
// if (deliverability === "UNDELIVERABLE") {
//   return NextResponse.json(
//     { error: "Invalid email address. Please enter a valid one." },
//     { status: 403 }
//   );
// }
//     // ✅ STEP 1: Check if user exists
//     const checkUser = await getUserbyEmail(safeEmail);
//     if (checkUser) {
//       return NextResponse.json({
//         message: 'Invalid Credentials',
//         success: false
//       }, { status: 409 });
//     }
    
//     // ✅ STEP 2: Store temp registration data (name, email, password)
//     await storeTempUser(name, safeEmail, password);
    
//     // ✅ STEP 3: Send OTP email
//     const sendOtp = await sendOTPEmail(email, name);
    
//     if (!sendOtp.success) {
//       return NextResponse.json({
//         message: "Failed to send OTP. Please try again.",
//         success: false
//       }, { status: 500 });
//     }
    
//     // ✅ SUCCESS: OTP sent, waiting for verification
//     return NextResponse.json({
//       message: 'OTP sent! Check your inbox.',
//       success: true,
//       requiresOTP: true  // Frontend shows OTP input
//     });
    
//   } catch (error) {
//     console.error('Register error:', error.message);
//     return NextResponse.json({
//       message: 'Server error',
//       success: false
//     }, { status: 500 });
//   }
// }



import { sendOTPEmail } from "@/controllers/VerifyEmail";
import { getUserbyEmail } from "@/models/users";
import { storeTempUser } from "@/models/verifyEmail";
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
    const { name, email, password, recaptchaToken } = await req.json();
    const safeEmail = normalizeEmail(email);

    // 🛑 1. Block if no recaptcha
    if (!recaptchaToken) {
      return NextResponse.json(
        { error: "Security check failed." },
        { status: 400 }
      );
    }

    // 🛑 2. Verify reCAPTCHA
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;

    const recaptchaRes = await fetch(verifyUrl, { method: "POST" });
    const recaptchaData = await recaptchaRes.json();

    if (!recaptchaData.success || recaptchaData.score < 0.5) {
      return NextResponse.json(
        { error: "Bot detected." },
        { status: 403 }
      );
    }

    // 🧠 Extract domain
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
    if (checkUser) {
      return NextResponse.json(
        {
          message: "Invalid Credentials",
          success: false
        },
        { status: 409 }
      );
    }

    // ✅ STEP 4: Store temp user
    await storeTempUser(name, safeEmail, password);

    // ✅ STEP 5: Send OTP
    const sendOtp = await sendOTPEmail(safeEmail, name);

    if (!sendOtp.success) {
      return NextResponse.json(
        {
          message: "Failed to send OTP",
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