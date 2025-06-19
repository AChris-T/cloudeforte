import User from '../models/User.js';
import Otp from '../models/Otp.js';
import bcrypt from 'bcrypt';
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
    sendOTP(email, otp);

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

    // Update user: set isVerified to true
    await User.findOneAndUpdate(
      { email },
      { isVerified: true }
    );

    // Delete used OTP
    await Otp.deleteOne({ _id: otpRecord._id });

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    next(error);
  }
};
// Resend OTP
export const resendOtp = async (req, res, next) => {
  console.log('REQ BODY:', req.body);
  try {
    const { email } = req.body;
    console.log('REQ BODY EMAIL:', req.body.email);

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
    sendOTP(email, otp);

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

    // Check if verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email first'
      });
    }

    // Tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        isVerified: user.isVerified
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
