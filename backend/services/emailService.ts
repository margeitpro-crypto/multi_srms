import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import logger from './logger';

dotenv.config();

// Create a transporter based on environment
let transporter: nodemailer.Transporter;

if (process.env.EMAIL_SERVICE === 'ethereal') {
  // For testing, we'll create a new Ethereal account each time
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || ''
    }
  });
} else {
  // Production transporter using Gmail SMTP
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your_email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your_app_password'
    }
  });
}

// Send OTP email
export const sendOtpEmail = async (email: string, otp: string): Promise<boolean> => {
  try {
    // Skip sending emails in test environment
    if (process.env.NODE_ENV === 'test') {
      logger.info(`[TEST MODE] Would send OTP ${otp} to ${email}`);
      logger.info(`[TEST MODE] In production, this would be sent via ${process.env.EMAIL_SERVICE || 'gmail'}`);
      return true;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || 'your_email@gmail.com',
      to: email,
      subject: 'Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>You have requested to reset your password. Please use the following OTP to proceed:</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
            <h1 style="margin: 0; color: #4CAF50; letter-spacing: 5px; font-size: 36px;">${otp}</h1>
          </div>
          <p>This OTP will expire in 5 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="margin: 30px 0;">
          <p style="font-size: 12px; color: #999;">This is an automated message. Please do not reply to this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    logger.info(`OTP email sent successfully to ${email}`);
    return true;
  } catch (error) {
    logger.error('Error sending OTP email:', error);
    return false;
  }
};

// Function to create a test email account for Ethereal
export const createTestAccount = async () => {
  if (process.env.EMAIL_SERVICE === 'ethereal') {
    try {
      const testAccount = await nodemailer.createTestAccount();
      logger.info('Ethereal Test Account Created:');
      logger.info('User:', testAccount.user);
      logger.info('Pass:', testAccount.pass);
      return testAccount;
    } catch (error) {
      logger.error('Failed to create Ethereal test account:', error);
    }
  }
  return null;
};

export default { sendOtpEmail, createTestAccount };