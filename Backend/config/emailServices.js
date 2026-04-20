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
            from: `"Roots Classes" <${process.env.EMAIL_USER}>`,
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

// Function to send Callback Request to Admin
const sendCallbackEmail = async (userData) => {
    try {
        const { firstName, lastName, mobileNumber, email, stream, studentClass } = userData;

        const mailOptions = {
            from: `"Roots Classes Portal" <${process.env.EMAIL_USER}>`,
            to: "rootsclasses1313@gmail.com",
            subject: 'New Expert Advice Request - Roots Classes',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
                    <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
                        <h2 style="color: #ffffff; margin: 0;">New Callback Request</h2>
                    </div>
                    <div style="padding: 30px; line-height: 1.6; color: #333;">
                        <p>Dear Admin,</p>
                        <p>A new user has submitted the <strong>Get Expert Advice</strong> form on the website. Below are the details:</p>
                        
                        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #4F46E5; margin-top: 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">User Information</h3>
                            <p style="margin: 8px 0;"><strong>First Name:</strong> ${firstName}</p>
                            <p style="margin: 8px 0;"><strong>Last Name:</strong> ${lastName}</p>
                            <p style="margin: 8px 0;"><strong>Mobile Number:</strong> ${mobileNumber}</p>
                            <p style="margin: 8px 0;"><strong>Email ID:</strong> ${email}</p>
                            
                            <h3 style="color: #4F46E5; margin: 20px 0 10px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">Academic Details</h3>
                            <p style="margin: 8px 0;"><strong>Stream:</strong> ${stream}</p>
                            <p style="margin: 8px 0;"><strong>Class:</strong> ${studentClass}</p>
                        </div>
                        
                        <p style="font-size: 14px; color: #6b7280; font-style: italic;">
                            * User has agreed to receive WhatsApp communication and accepted the Terms & Conditions and Privacy Policy.
                        </p>
                        
                        <p style="margin-top: 30px;">Please reach out to the user at the earliest to provide assistance.</p>
                        
                        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
                        <p style="text-align: center; color: #9ca3af; font-size: 12px;">
                            RootsClasses Portal • Automated Notification
                        </p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Callback Email sent: ', info.response);
        return true;
    } catch (error) {
        console.error('Error sending callback email:', error);
        return false;
    }
};

export { sendOTP, sendCallbackEmail };
