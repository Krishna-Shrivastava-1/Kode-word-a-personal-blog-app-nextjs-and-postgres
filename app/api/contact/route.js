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
    const { name, email, subject, message } = await req.json()

    // Validate
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: 'All fields are required' }), 
        { status: 400 }
      )
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
