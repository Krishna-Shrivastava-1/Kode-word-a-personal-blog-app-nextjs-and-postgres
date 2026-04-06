// import { streamText } from "ai"
// import { openai } from "@ai-sdk/openai"
// import { NextResponse } from "next/server"

// export async function POST(req) {
//   const { query } = await req.json()

// const resp = await fetch(process.env.CHATBASEURL,{
//     method:'POST',
//      headers: {
//         "Content-Type": "application/json",
//       },
//     body:JSON.stringify({query:query, top_k: 3})
//   })
// const data = await resp.json()
// // console.log(data)
//   return NextResponse.json({
//     message:'response successful',
//     status:200,
//     success:true,
//     data:data
//   })
// }


import { NextResponse } from "next/server"

export async function POST(req) {
  try {
    // ✅ 1. Extract the query AND the token from the request
    const { query, recaptchaToken } = await req.json()

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

    // ==========================================
    // ✅ 5. IF WE GET HERE, IT IS A REAL HUMAN! 
    // Now we can safely call your chatbot API
    // ==========================================
    const resp = await fetch(process.env.CHATBASEURL, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: query, top_k: 3 })
    })
    
    const data = await resp.json()

    return NextResponse.json({
      message: 'response successful',
      status: 200,
      success: true,
      data: data
    })

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    )
  }
}