import nodemailer from "nodemailer";
import "dotenv/config";

const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    ciphers: "SSLv3",
  },
});

export async function sendOtpEmail(email = "", otp) {
  if (!email) return false;
  try {
    await transporter.sendMail({
      from: `"BSG India" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code – BSG India",
      html: `
      <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;padding:20px;background-color:#f4f6f9;color:#333">
        <div style="max-width:500px;margin:auto;background:#ffffff;padding:30px;border-radius:10px;box-shadow:0 0 10px rgba(0,0,0,0.1)">
          <h2 style="color:#1D56A5;text-align:center">🔐 One-Time Password (OTP)</h2>
          <p style="font-size:16px;line-height:1.5">Dear User,</p>
          <p style="font-size:16px;line-height:1.5">Your OTP for verification is:</p>
          <div style="text-align:center;margin:20px 0">
            <span style="font-size:28px;font-weight:bold;color:#1D56A5;background-color:#FFDA00;padding:12px 24px;border-radius:8px;display:inline-block">
              ${otp}
            </span>
          </div>
          <p style="font-size:14px;color:#666">This OTP is valid for <strong>5 minutes</strong>. Please do not share it with anyone.</p>
          <hr style="margin:30px 0;border:none;border-top:1px solid #ddd">
          <p style="font-size:13px;text-align:center;color:#999">
            If you didn't request this OTP, please ignore this email.<br>
            Thank you,<br>
            <strong>The Bharat Scouts and Guides Team</strong>
          </p>
        </div>
      </div>`,
    });
    console.log(`OTP email sent to ${email}`);
    return true;
  } catch (error) {
    console.log(`OTP email NOT sent to ${email} [ERROR]: ${error}`);
    return false;
  }
}

export async function sendPasswordResetEmail(email = "", resetLink) {
  try {
    await transporter.sendMail({
      from: `"BSG India" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your Password – BSG India",
      html: `
      <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;padding:20px;background-color:#f4f6f9;color:#333">
        <div style="max-width:500px;margin:auto;background:#ffffff;padding:30px;border-radius:10px;box-shadow:0 0 10px rgba(0,0,0,0.1)">
          <h2 style="color:#1D56A5;text-align:center">🔑 Password Reset Request</h2>
          <p style="font-size:16px;line-height:1.5">Dear User,</p>
          <p style="font-size:16px;line-height:1.5">We received a request to reset your password. Click the button below:</p>
          <div style="text-align:center;margin:20px 0">
            <a href="${resetLink}" style="display:inline-block;background-color:#1D56A5;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px">
              Reset Password
            </a>
          </div>
          <p style="font-size:14px;color:#666">This link expires in <strong>30 minutes</strong>. If you didn't request this, ignore this email.</p>
          <hr style="margin:30px 0;border:none;border-top:1px solid #ddd">
          <p style="font-size:13px;text-align:center;color:#999">
            Thank you,<br><strong>The Bharat Scouts and Guides Team</strong>
          </p>
        </div>
      </div>`,
    });
    console.log(`Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.log(`Password reset email NOT sent to ${email} [ERROR]: ${error}`);
    return false;
  }
}

export async function sendRegistrationEmail(email = "", password = "") {
  try {
    await transporter.sendMail({
      from: `"BSG India" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Registration Successful – BSG India",
      html: `
      <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;padding:20px;background-color:#f4f6f9;color:#333">
        <div style="max-width:500px;margin:auto;background:#ffffff;padding:30px;border-radius:10px;box-shadow:0 0 10px rgba(0,0,0,0.1)">
          <h2 style="color:#1D56A5;text-align:center">🎉 Registration Successful</h2>
          <p style="font-size:16px;line-height:1.5">Dear User,</p>
          <p style="font-size:16px;line-height:1.5">Your account has been successfully created on <strong>BSG India - Rashtrapati Guild Portal</strong>.</p>
          <div style="background-color:#f0f4ff;padding:20px;border-radius:8px;margin:20px 0">
            <p style="font-size:14px;margin:4px 0"><strong>Email:</strong> ${email}</p>
            <p style="font-size:14px;margin:4px 0"><strong>Password:</strong> ${password}</p>
          </div>
          <p style="font-size:14px;color:#666">Please keep these credentials safe. You can now login and fill your application form.</p>
          <hr style="margin:30px 0;border:none;border-top:1px solid #ddd">
          <p style="font-size:13px;text-align:center;color:#999">
            Thank you,<br><strong>The Bharat Scouts and Guides Team</strong>
          </p>
        </div>
      </div>`,
    });
    console.log(`Registration email sent to ${email}`);
    return true;
  } catch (error) {
    console.log(`Registration email NOT sent to ${email} [ERROR]: ${error}`);
    return false;
  }
}

export async function sendFormSubmissionEmail(email = "", name = "") {
  try {
    await transporter.sendMail({
      from: `"BSG India" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Application Submitted Successfully – BSG India",
      html: `
      <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;padding:20px;background-color:#f4f6f9;color:#333">
        <div style="max-width:500px;margin:auto;background:#ffffff;padding:30px;border-radius:10px;box-shadow:0 0 10px rgba(0,0,0,0.1)">
          <h2 style="color:#1D56A5;text-align:center">📋 Application Submitted</h2>
          <p style="font-size:16px;line-height:1.5">Dear <strong>${name}</strong>,</p>
          <p style="font-size:16px;line-height:1.5">Your Rashtrapati Guild application has been submitted successfully and is now <strong>under review</strong>.</p>
          <div style="background-color:#f0f9f4;padding:15px;border-radius:8px;margin:20px 0;border-left:4px solid #22c55e">
            <p style="font-size:14px;color:#166534;margin:0">✅ Your application is pending admin verification. You will be notified once it is reviewed.</p>
          </div>
          <p style="font-size:14px;color:#666">You can check your application status anytime from your dashboard.</p>
          <hr style="margin:30px 0;border:none;border-top:1px solid #ddd">
          <p style="font-size:13px;text-align:center;color:#999">
            Thank you,<br><strong>The Bharat Scouts and Guides Team</strong>
          </p>
        </div>
      </div>`,
    });
    console.log(`Form submission email sent to ${email}`);
    return true;
  } catch (error) {
    console.log(`Form submission email NOT sent to ${email} [ERROR]: ${error}`);
    return false;
  }
}

export default sendOtpEmail;
