import { addOTP } from "@/models/verifyEmail.js";
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_CRED,
  }
});

export async function sendOTPEmail(email, name = 'User') {
  try {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save OTP to database
    await addOTP(email, otp);
    
    const mailOptions = {
      from: process.env.SECRET_EMAIL,
      to: email,
      subject: "Verify Your Email – Kode$word 🔒",
      html: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Verify Your Email - Kode$word</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        color: #333333;
        padding: 20px;
      }
      .container {
        background-color: #ffffff;
        border-radius: 8px;
        padding: 40px;
        max-width: 600px;
        margin: auto;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        text-align: center;
      }
      h1 {
        color: #e11d48;
        margin-bottom: 10px;
      }
      .otp-box {
        background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);
        color: white;
        font-size: 36px;
        font-weight: bold;
        letter-spacing: 8px;
        padding: 20px;
        border-radius: 8px;
        margin: 30px 0;
        display: inline-block;
      }
      .warning {
        background-color: #fef2f2;
        border-left: 4px solid #e11d48;
        padding: 12px;
        margin: 20px 0;
        text-align: left;
      }
      .footer {
        margin-top: 40px;
        font-size: 12px;
        color: #999999;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>🔐 Email Verification</h1>
      <p>Hi ${name},</p>
      <p>Welcome to <strong>Kode$word</strong>! To complete your registration, please verify your email address.</p>
      
      <p style="margin-top: 30px; font-size: 14px; color: #666;">Your verification code is:</p>
      <div class="otp-box">${otp}</div>
      
      <div class="warning">
        <strong>⏱️ This code expires in 5 minutes</strong><br/>
        Never share this code with anyone. Kode$word staff will never ask for it.
      </div>
      
      <p style="margin-top: 30px; font-size: 14px; color: #666;">
        If you didn't request this, please ignore this email.
      </p>
      
      <div class="footer">
        © 2025 Kode$word – Secure Blogging Platform<br/>
        This is an automated message, please do not reply.
      </div>
    </div>
  </body>
</html>
`,
    };
    
    // Use async/await instead of callback
    await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent to:', email);
    
    return { success: true, message: 'OTP sent successfully' };
    
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    return { success: false, message: 'Failed to send OTP email' };
  }
}
