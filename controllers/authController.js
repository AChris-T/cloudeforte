import User from '../models/User.js';
import Otp from '../models/Otp.js';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/generateToken.js';
import { generateOTP, sendOTP } from '../utils/generateOtp.js';

// Register new user
export const register = async (req, res, next) => {
  try {
    const {
      companyName,
      contact,
      email,
      companySize,
      businessProfession,
      requestDemo,
      password
    } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user — schema will hash password
    const user = await User.create({
      companyName,
      contact,
      email,
      companySize,
      businessProfession,
      requestDemo,
      password
    });

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Save OTP to OTP model
    await Otp.create({
      email,
      otp,
      expiresAt: otpExpiry
    });

    // Send OTP
    sendOTP(email, otp, 'email verification');

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      otp
    });

  } catch (error) {
    next(error);
  }
};
// Verify OTP
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    // Find OTP record
    const otpRecord = await Otp.findOne({
      email,
      otp,
      expiresAt: { $gt: new Date() } // Check that OTP is not expired
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Mark OTP as verified
    await Otp.findByIdAndUpdate(otpRecord._id, { isVerified: true });

    res.json({
      success: true,
      message: 'OTP verified successfully'
    });

  } catch (error) {
    next(error);
  }
};
// Resend OTP
export const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'User is already verified'
      });
    }

    // Delete any existing OTPs for this email
    await Otp.deleteMany({ email });

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // Save new OTP
    await Otp.create({
      email,
      otp,
      expiresAt: otpExpiry
    });

    // Send new OTP
    sendOTP(email, otp, 'email verification');

    res.json({
      success: true,
      message: 'New OTP sent successfully',
      otp // optional — for testing — you can remove in prod
    });

  } catch (error) {
    next(error);
  }
};
// Login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate tokens regardless of verification status
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        isVerified: user.isVerified,
        user: {
          id: user._id,
          email: user.email,
          companyName: user.companyName
        }
      }
    });

  } catch (error) {
    next(error);
  }
};
// Refresh token
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    // Verify refresh token
    const decoded = verifyToken(token, true);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken(decoded.userId);

    res.json({
      success: true,
      data: { accessToken }
    });

  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Delete any existing OTPs for this email
    await Otp.deleteMany({ email });

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save new OTP
    await Otp.create({
      email,
      otp,
      expiresAt: otpExpiry
    });

    // Send OTP for password reset
    sendOTP(email, otp, 'password reset');

    res.json({ 
      success: true, 
      message: 'OTP sent to email successfully' 
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    
    if (!email || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and new password are required' 
      });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if there's a verified OTP for this email
    const otpRecord = await Otp.findOne({
      email,
      isVerified: true,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please verify your OTP first' 
      });
    }

    // Hash the password manually to avoid middleware issues
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password using findOneAndUpdate to preserve other fields
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { 
        password: hashedPassword,
        // Preserve the verification status
        isVerified: user.isVerified 
      },
      { new: true, runValidators: true }
    );

    // Clear the OTP record
    await Otp.deleteOne({ _id: otpRecord._id });

    res.json({ 
      success: true, 
      message: 'Password reset successful',
      isVerified: updatedUser.isVerified
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOtpForPasswordReset = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    // Find OTP record for password reset
    const otpRecord = await Otp.findOne({
      email,
      otp,
      expiresAt: { $gt: new Date() } // Check that OTP is not expired
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Mark OTP as verified for password reset
    await Otp.findByIdAndUpdate(otpRecord._id, { isVerified: true });

    res.json({
      success: true,
      message: 'OTP verified successfully. You can now reset your password.'
    });

  } catch (error) {
    next(error);
  }
};
