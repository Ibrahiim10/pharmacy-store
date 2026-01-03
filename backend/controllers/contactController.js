import ContactMessage from "../models/ContactMessage.js"
import { transporter } from "../utils/mailer.js"

export const createContactMessage = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body

    // 1. Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({
        message: "Name, email, and message are required",
      })
    }

    // 2. Save message to DB
    const savedMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || "",
      subject: subject?.trim() || "",
      message: message.trim(),
    })

    // 3. Send email to ADMIN (you)
    await transporter.sendMail({
      from: `"Pharmacy Store Contact" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      replyTo: savedMessage.email, // ⭐ KEY LINE
      subject:
        savedMessage.subject ||
        `New contact message from ${savedMessage.name}`,
      text: `
New Contact Message

Name: ${savedMessage.name}
Email: ${savedMessage.email}
Phone: ${savedMessage.phone || "N/A"}
Subject: ${savedMessage.subject || "N/A"}

Message:
${savedMessage.message}
      `,
    })

    // 4. Respond to client
    res.status(201).json({
      success: true,
      message: "Message sent successfully. We will contact you soon.",
    })
  } catch (error) {
    next(error)
  }
}
