import { Router, Request, Response } from 'express';
import { getUserByEmail, updateUserPassword } from '../services/userService';
import { otpService } from '../services/dbService';
import { sendOtpEmail } from '../services/emailService';

const router = Router();

// Generate a 6-digit OTP
const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// POST /api/otp/send - Send OTP to user's email
router.post('/send', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const user = await getUserByEmail(email);
    if (!user) {
      // For security reasons, we don't reveal if the email exists
      return res.json({ message: 'If the email exists, an OTP has been sent' });
    }

    // Generate OTP
    const otp = generateOtp();

    // Store OTP in database
    await otpService.createOtp(email, otp);

    // Send OTP via email
    const emailSent = await sendOtpEmail(email, otp);
    
    if (emailSent) {
      res.json({ message: 'OTP sent successfully' });
    } else {
      res.status(500).json({ error: 'Failed to send OTP email' });
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// POST /api/otp/verify - Verify OTP
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    // Validate inputs
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Verify OTP
    const result = await otpService.verifyOtp(email, otp);
    
    if (result.valid) {
      res.json({ message: result.message });
    } else {
      res.status(400).json({ error: result.message });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// POST /api/otp/reset-password - Reset password with OTP
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Validate inputs
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Verify OTP
    const result = await otpService.verifyOtp(email, otp);
    
    if (!result.valid) {
      return res.status(400).json({ error: result.message });
    }

    // Update user's password
    // First get the user to ensure they exist
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update password
    const updatedUser = await updateUserPassword(user.id, newPassword);
    if (!updatedUser) {
      return res.status(500).json({ error: 'Failed to update password' });
    }

    // Delete used OTP
    await otpService.deleteOtp(email, otp);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

export default router;