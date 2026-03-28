import nodemailer from "nodemailer";
import axios from "axios";

export default async function handler(req, res) {

  // ✅ CORS (allow all origins)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { receiverEmail, subject, message } = req.body;

  try {
    // 📧 Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: receiverEmail,
      subject,
      text: message,
    });

    // 🤖 Telegram
    await axios.post(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
      {
        chat_id: process.env.CHAT_ID,
        text: `📩 New Form Submission:\n\n${message}`,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Email & Telegram sent!",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      error: "Something went wrong",
    });
  }
}