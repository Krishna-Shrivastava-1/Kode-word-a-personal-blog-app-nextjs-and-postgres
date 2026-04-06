import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_CRED,
  }
});

export async function POST(req) {
  try {
    // ✅ Get JSON data from request body
    const { name, email, subject, message ,recaptchaToken} = await req.json()

    // Validate
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: 'All fields are required' }), 
        { status: 400 }
      )
    }
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
    // Send email directly to you
    await transporter.sendMail({
      from: email,
      to: process.env.SECRET_EMAIL, // Your email
      subject: `New Contact: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    })

    return new Response(
      JSON.stringify({ success: true, message: 'Message sent successfully' }), 
      { status: 200 }
    )

  } catch (error) {
    console.error('Email error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to send message' }), 
      { status: 500 }
    )
  }
}
