// ========================================
// DormX OTP Verification Server
// Node.js Express Server
// ========================================

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory OTP storage (in production, use Redis or database)
const otpStore = new Map();

// 🚨 IMPORTANT: Configure your Gmail credentials below for OTP emails
// 1. Enable 2FA on Gmail
// 2. Generate App Password: https://myaccount.google.com/apppasswords
// 3. Replace the placeholders below

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com', // Replace with your email
        pass: 'your-app-password'     // Replace with your app password
    }
});

// Configuration
const OTP_EXPIRY = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN = 30 * 1000; // 30 seconds
const MAX_OTP_ATTEMPTS = 3;

// ========================================
// Helper Functions
// ========================================

function generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
}

function storeOTP(key, otp) {
    otpStore.set(key, {
        otp: otp,
        expiresAt: Date.now() + OTP_EXPIRY,
        attempts: 0,
        lastSent: Date.now()
    });
}

function verifyOTP(key, inputOTP) {
    const record = otpStore.get(key);
    
    if (!record) {
        return { valid: false, message: 'OTP not found or expired. Please request a new OTP.' };
    }
    
    if (Date.now() > record.expiresAt) {
        otpStore.delete(key);
        return { valid: false, message: 'OTP has expired. Please request a new OTP.' };
    }
    
    if (record.attempts >= MAX_OTP_ATTEMPTS) {
        otpStore.delete(key);
        return { valid: false, message: 'Too many failed attempts. Please request a new OTP.' };
    }
    
    if (record.otp === inputOTP) {
        otpStore.delete(key);
        return { valid: true, message: 'OTP verified successfully' };
    }
    
    record.attempts++;
    otpStore.set(key, record);
    return { valid: false, message: 'Invalid OTP. Please try again.' };
}

function canResend(key) {
    const record = otpStore.get(key);
    if (!record) return true;
    return Date.now() - record.lastSent >= RESEND_COOLDOWN;
}

function getCooldownRemaining(key) {
    const record = otpStore.get(key);
    if (!record) return 0;
    const remaining = RESEND_COOLDOWN - (Date.now() - record.lastSent);
    return Math.max(0, Math.ceil(remaining / 1000));
}

// ========================================
// API Routes
// ========================================

// Send Mobile OTP (simulated - in production, integrate with SMS service)
app.post('/api/otp/send-mobile', (req, res) => {
    const { mobile } = req.body;
    
    if (!mobile) {
        return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }
    
    // Validate mobile format
    if (!/^\d{10}$/.test(mobile)) {
        return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number' });
    }
    
    const key = `mobile:${mobile}`;
    
    // Check cooldown
    if (!canResend(key)) {
        const remaining = getCooldownRemaining(key);
        return res.status(429).json({ 
            success: false, 
            message: `Please wait ${remaining} seconds before requesting a new OTP`,
            cooldown: remaining
        });
    }
    
    // Generate and store OTP
    const otp = generateOTP();
    storeOTP(key, otp);
    
    // In production, integrate with SMS service like Twilio, Msg91, etc.
    // For demo purposes, we'll log the OTP and send a simulated response
    console.log(`[SMS] OTP for ${mobile}: ${otp}`);
    
    res.json({ 
        success: true, 
        message: 'OTP sent successfully to your mobile number',
        // Remove this in production - for testing only
        debugOTP: otp 
    });
});

// Send Email OTP
app.post('/api/otp/send-email', (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }
    
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    }
    
    const key = `email:${email}`;
    
    // Check cooldown
    if (!canResend(key)) {
        const remaining = getCooldownRemaining(key);
        return res.status(429).json({ 
            success: false, 
            message: `Please wait ${remaining} seconds before requesting a new OTP`,
            cooldown: remaining
        });
    }
    
    // Generate and store OTP
    const otp = generateOTP();
    storeOTP(key, otp);
    
    // Send email with OTP
    const mailOptions = {
        from: '"DormX" <noreply@dormx.com>',
        to: email,
        subject: 'DormX - Email Verification OTP',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <div style="text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">🎓 DormX</h1>
                </div>
                <div style="padding: 20px;">
                    <h2 style="color: #333;">Email Verification</h2>
                    <p style="color: #666;">Your OTP for email verification is:</p>
                    <div style="background: #f5f5f5; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #667eea;">${otp}</span>
                    </div>
                    <p style="color: #666; font-size: 14px;">This OTP will expire in 5 minutes.</p>
                    <p style="color: #999; font-size: 12px;">If you didn't request this OTP, please ignore this email.</p>
                </div>
                <div style="background: #f5f5f5; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
                    <p style="color: #999; margin: 0; font-size: 12px;">© 2024 DormX - College Marketplace Platform</p>
                </div>
            </div>
        `
    };
    
    // Try to send email, but don't fail if email is not configured
    transporter.sendMail(mailOptions)
        .then(() => {
            console.log(`[Email] OTP sent to ${email}`);
        })
        .catch(err => {
            console.log(`[Email] Failed to send email: ${err.message}`);
            console.log(`[Email] OTP for ${email}: ${otp}`); // For testing
        });
    
    res.json({ 
        success: true, 
        message: 'OTP sent successfully to your email address',
        // Remove this in production - for testing only
        debugOTP: otp
    });
});

// Verify Mobile OTP
app.post('/api/otp/verify-mobile', (req, res) => {
    const { mobile, otp } = req.body;
    
    if (!mobile || !otp) {
        return res.status(400).json({ success: false, message: 'Mobile number and OTP are required' });
    }
    
    const key = `mobile:${mobile}`;
    const result = verifyOTP(key, otp);
    
    if (result.valid) {
        res.json({ success: true, message: 'Mobile number verified successfully' });
    } else {
        res.status(400).json({ success: false, message: result.message });
    }
});

// Verify Email OTP
app.post('/api/otp/verify-email', (req, res) => {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
        return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }
    
    const key = `email:${email}`;
    const result = verifyOTP(key, otp);
    
    if (result.valid) {
        res.json({ success: true, message: 'Email verified successfully' });
    } else {
        res.status(400).json({ success: false, message: result.message });
    }
});

// Check cooldown status
app.get('/api/otp/status/:type/:value', (req, res) => {
    const { type, value } = req.params;
    const key = `${type}:${value}`;
    
    const remaining = getCooldownRemaining(key);
    res.json({ 
        cooldown: remaining,
        canResend: remaining === 0
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                    DormX OTP Server                         ║
║                                                            ║
║  Server running on: http://localhost:${PORT}                ║
║                                                            ║
║  Endpoints:                                               ║
║  - POST /api/otp/send-mobile    → Send mobile OTP         ║
║  - POST /api/otp/send-email     → Send email OTP          ║
║  - POST /api/otp/verify-mobile  → Verify mobile OTP      ║
║  - POST /api/otp/verify-email   → Verify email OTP       ║
║  - GET  /api/otp/status/:type/:value → Check cooldown    ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
});

