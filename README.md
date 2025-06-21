# Authentication API

A secure authentication system built with Express.js, MongoDB, and JWT tokens.

## Features

- User registration with email verification
- Secure password reset with OTP
- JWT-based authentication (access + refresh tokens)
- Password hashing with bcrypt
- Input validation and error handling
- Email verification required for full access

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-otp` - Verify email with OTP
- `POST /api/auth/resend-otp` - Resend verification OTP
- `POST /api/auth/login` - Login user (returns tokens regardless of verification status)
- `POST /api/auth/refresh-token` - Refresh access token

### Password Reset
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/verify-otp-reset` - Verify OTP for password reset
- `POST /api/auth/reset-password` - Reset password

## Login Response

The login endpoint returns access and refresh tokens regardless of verification status:

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "isVerified": true,
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "companyName": "Company Name"
    }
  }
}
```

## Environment Variables

```
MONGODB_URI=mongodb://localhost:27017/your-database
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
```

## Installation

```bash
npm install
npm run dev
```

## Security Features

- Password hashing with bcrypt (salt rounds: 10)
- JWT tokens with different expiration times
- OTP-based email verification
- Input validation with express-validator
- CORS enabled
- Automatic OTP expiration (10 minutes) 