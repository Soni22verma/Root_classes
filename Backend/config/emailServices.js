import nodemailer from "nodemailer";
// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    }
});

// Function to send OTP
const sendOTP = async (email, otp) => {
    try {
        const mailOptions = {
            from: `"Root Classes" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your OTP Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4F46E5;">Email Verification</h2>
                    <p>Your OTP code is:</p>
                    <h1 style="font-size: 32px; color: #4F46E5; letter-spacing: 5px;">${otp}</h1>
                    <p>This OTP is valid for 1 min.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <hr />
                    <p style="color: #666; font-size: 12px;">© 2024 Your Company. All rights reserved.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ', info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

export default sendOTP