export const generateOTP = () => {
  // Generate a 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = (email, otp) => {
  // In a real application, this would send an email
  // For now, we'll just console log it
  console.log(`OTP for ${email}: ${otp}`);
  return true;
}; 