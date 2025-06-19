import express from 'express';
import {
  register,
  verifyOtp,
  resendOtp,
  login,
  refreshToken
} from '../controllers/authController.js';
import {
  registerValidator,
  verifyOtpValidator,
  resendOtpValidator,
  loginValidator,
  refreshTokenValidator
} from '../validators/authValidators.js';
import { handleValidationErrors } from '../middleware/errorHandler.js';

const router = express.Router();

router.post('/register', registerValidator, handleValidationErrors, register);
router.post('/verify-otp', verifyOtpValidator, handleValidationErrors, verifyOtp);
router.post('/resend-otp', resendOtpValidator, handleValidationErrors, resendOtp);
router.post('/login', loginValidator, handleValidationErrors, login);
router.post('/refresh-token', refreshTokenValidator, handleValidationErrors, refreshToken);

export default router; 