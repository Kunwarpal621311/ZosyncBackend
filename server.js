require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 3000;

// 1. The Allowed List (Add your Live Server and future GitHub Pages URLs here)
const allowedOrigins = [
    'http://127.0.0.1:5501', 
    'http://localhost:5501',
    'http://127.0.0.1:5500', // Added just in case Live Server switches ports
    'http://localhost:5500',
    'https://your-github-username.github.io' // Your future hosted URL
];

// 2. Configure CORS to accept requests from the allowed list
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like Postman or curl)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true); // Origin is allowed
        } else {
            callback(new Error('Not allowed by CORS')); // Origin is blocked
        }
    },
    methods: ['POST', 'GET', 'OPTIONS'], // Explicitly allow POST methods
    allowedHeaders: ['Content-Type'] // Allow JSON headers
}));

app.use(express.json()); // Allows us to parse JSON data from the frontend

// 3. The API Route
app.post('/api/send-email', async (req, res) => {
    const { receiverEmail, subject, message } = req.body;

    try {
        // 📧 Email setup
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: receiverEmail,
            subject: subject,
            text: message
        };

        // 📤 Send Email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);

        // 🤖 Send Telegram Message
        await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
            chat_id: process.env.CHAT_ID,
            text: `📩 New Form Submission:\n\n${message}`
        });

        // ✅ SINGLE RESPONSE
        return res.status(200).json({
            success: true,
            message: "Email & Telegram notification sent!"
        });

    } catch (error) {
        console.error('Error:', error);

        return res.status(500).json({
            success: false,
            error: "Something went wrong."
        });
    }
});

// 4. Start the server
app.listen(PORT, () => {
    console.log(`Backend API is running locally at http://localhost:${PORT}`);
});