import express from 'express';
import {
  register,
  verifyOtp,
  resendOtp,
  login,
  refreshToken,
  forgotPassword,
  verifyOtpForPasswordReset,
  resetPassword
} from '../controllers/authController.js';
import {
  registerValidator,
  verifyOtpValidator,
  resendOtpValidator,
  loginValidator,
  refreshTokenValidator,
  forgotPasswordValidator,
  resetPasswordValidator
} from '../validators/authValidators.js';
import { handleValidationErrors } from '../middleware/errorHandler.js';

const router = express.Router();

// Registration and email verification routes
router.post('/register', registerValidator, handleValidationErrors, register);
router.post('/verify-otp', verifyOtpValidator, handleValidationErrors, verifyOtp);
router.post('/resend-otp', resendOtpValidator, handleValidationErrors, resendOtp);

// Authentication routes
router.post('/login', loginValidator, handleValidationErrors, login);
router.post('/refresh-token', refreshTokenValidator, handleValidationErrors, refreshToken);

// Password reset routes
router.post('/forgot-password', forgotPasswordValidator, handleValidationErrors, forgotPassword);
router.post('/verify-otp-reset', verifyOtpValidator, handleValidationErrors, verifyOtpForPasswordReset);
router.post('/reset-password', resetPasswordValidator, handleValidationErrors, resetPassword);

export default router; 