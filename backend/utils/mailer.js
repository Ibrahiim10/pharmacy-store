import nodemailer from "nodemailer"

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE) === "true", // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// optional: verify connection on startup (recommended in dev)
export const verifyMailer = async () => {
  try {
    await transporter.verify()
    console.log("✅ SMTP mailer ready")
  } catch (err) {
    console.log("❌ SMTP mailer error:", err?.message)
  }
}
