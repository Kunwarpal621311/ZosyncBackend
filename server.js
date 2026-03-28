require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ CORS (allow all)
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// ✅ Mail transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

// ✅ Test route
app.get('/', (req, res) => {
    res.send('API is working 🚀');
});

// ✅ Main API
app.post('/api/send-email', async (req, res) => {
    const { receiverEmail, subject, message } = req.body;

    if (!receiverEmail || !subject || !message) {
        return res.status(400).json({
            success: false,
            error: "All fields are required"
        });
    }

    try {
        // 📧 Email
        const info = await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: receiverEmail,
            subject,
            text: message
        });

        console.log("Email sent:", info.response);

        // 🤖 Telegram
        await axios.post(
            `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
            {
                chat_id: process.env.CHAT_ID,
                text: `📩 New Form Submission:

📧 Email: ${receiverEmail}
📝 Subject: ${subject}
💬 Message: ${message}`
            }
        );

        return res.status(200).json({
            success: true,
            message: "Email & Telegram sent!"
        });

    } catch (error) {
        console.error("Error:", error);

        return res.status(500).json({
            success: false,
            error: "Something went wrong"
        });
    }
});

// ✅ Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});