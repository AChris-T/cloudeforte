export const generateOTP = () => {
  // Generate a 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = (email, otp, purpose = 'verification') => {
  // In a real application, this would send an email using nodemailer
  // For now, we'll just console log it with better formatting
  
  const timestamp = new Date().toLocaleString();
  console.log('\n' + '='.repeat(50));
  console.log(`📧 EMAIL SENT (${purpose.toUpperCase()})`);
  console.log('='.repeat(50));
  console.log(`To: ${email}`);
  console.log(`OTP: ${otp}`);
  console.log(`Time: ${timestamp}`);
  console.log(`Expires: ${new Date(Date.now() + 10 * 60 * 1000).toLocaleString()}`);
  console.log('='.repeat(50) + '\n');
  
  // TODO: Replace with actual email sending using nodemailer
  // Example implementation:
  /*
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Your ${purpose} OTP`,
    html: `
      <h2>Your OTP for ${purpose}</h2>
      <p>Your OTP is: <strong>${otp}</strong></p>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  };
  
  return transporter.sendMail(mailOptions);
  */
  
  return true;
}; 