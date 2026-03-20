import nodemailer, { createTestAccount } from "nodemailer";
import "dotenv/config";

const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASS,
  },
});
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST || "mail.bsgindia.live",
//   port: smtpPort,
//   secure: smtpPort === 465, // true for port 465 (SSL), false for 587 (STARTTLS)
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
// });

export async function sendOtpEmail(email = "", otp, name = "User") {
  if (!email) return false;
  try {
    await transporter.sendMail({
      from: `"Rashtrapati Guild Portal" <${"noreply@bsgindia.live"}>`,
      to: email,
      subject: "Your OTP – Rashtrapati Guild Portal",
      html: `
      <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;padding:20px;background-color:#f4f6f9;color:#333">
        <div style="max-width:520px;margin:auto;background:#ffffff;padding:0;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.08);overflow:hidden">
          <div style="background-color:#1D57A5;padding:20px 30px;text-align:center">
            <h2 style="color:#ffffff;margin:0;font-size:20px;letter-spacing:1px">🔐 OTP Verification</h2>
          </div>
          <div style="padding:30px">
            <p style="font-size:16px;line-height:1.6;margin:0 0 10px">Dear <strong>${name}</strong>,</p>
            <p style="font-size:15px;line-height:1.6;margin:0 0 20px">Your One Time Password for verification on the <strong>Rashtrapati Guild Portal</strong> is:</p>
            <div style="text-align:center;margin:24px 0">
              <span style="font-size:32px;font-weight:bold;color:#1D57A5;background-color:#EBF0F9;padding:14px 32px;border-radius:10px;display:inline-block;letter-spacing:6px;border:2px dashed #1D57A5">
                ${otp}
              </span>
            </div>
            <div style="background-color:#FFF8E1;padding:14px 18px;border-radius:8px;margin:20px 0;border-left:4px solid #FFB300">
              <p style="font-size:14px;color:#6D4C00;margin:0">⏱️ This OTP is valid for <strong>05 minutes</strong>.</p>
            </div>
            <div style="background-color:#FFF3F3;padding:14px 18px;border-radius:8px;margin:10px 0 20px;border-left:4px solid #EF4444">
              <p style="font-size:14px;color:#991B1B;margin:0">⚠️ For security reasons, please <strong>do not share this OTP</strong> with anyone.</p>
            </div>
            <p style="font-size:13px;color:#999;margin:20px 0 0;text-align:center;font-style:italic">This is an auto-generated email. Please do not reply to this email.</p>
          </div>
          <div style="background-color:#f8f9fb;padding:18px 30px;border-top:1px solid #eee;text-align:center">
            <p style="font-size:13px;color:#666;margin:0 0 4px">Regards,</p>
            <p style="font-size:14px;color:#1D57A5;font-weight:bold;margin:0">Rashtrapati Guild Portal</p>
            <p style="font-size:12px;color:#999;margin:4px 0 0">The Bharat Scouts and Guides<br>National Headquarters</p>
          </div>
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
      from: `"Rashtrapati Guild Portal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Application Submitted Successfully – Rashtrapati Guild Portal",
      html: `
      <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;padding:20px;background-color:#f4f6f9;color:#333">
        <div style="max-width:520px;margin:auto;background:#ffffff;padding:0;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.08);overflow:hidden">
          <div style="background-color:#1D57A5;padding:20px 30px;text-align:center">
            <h2 style="color:#ffffff;margin:0;font-size:20px;letter-spacing:1px">📋 Application Submitted</h2>
          </div>
          <div style="padding:30px">
            <p style="font-size:16px;line-height:1.6;margin:0 0 10px">Dear <strong>${name}</strong>,</p>
            <p style="font-size:15px;line-height:1.6;margin:0 0 20px">Your Rashtrapati Guild Award application has been <strong>submitted successfully</strong> and is now under review.</p>
            <div style="background-color:#f0f9f4;padding:16px 18px;border-radius:8px;margin:20px 0;border-left:4px solid #22c55e">
              <p style="font-size:14px;color:#166534;margin:0">✅ Your application is pending admin verification. You will be notified once it is reviewed.</p>
            </div>
            <p style="font-size:14px;color:#666;margin:16px 0 0">You can check your application status anytime from your <strong>Dashboard</strong>.</p>
            <p style="font-size:13px;color:#999;margin:20px 0 0;text-align:center;font-style:italic">This is an auto-generated email. Please do not reply to this email.</p>
          </div>
          <div style="background-color:#f8f9fb;padding:18px 30px;border-top:1px solid #eee;text-align:center">
            <p style="font-size:13px;color:#666;margin:0 0 4px">Regards,</p>
            <p style="font-size:14px;color:#1D57A5;font-weight:bold;margin:0">Rashtrapati Guild Portal</p>
            <p style="font-size:12px;color:#999;margin:4px 0 0">The Bharat Scouts and Guides<br>National Headquarters</p>
          </div>
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
