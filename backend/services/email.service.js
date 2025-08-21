import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendEmail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html
  };
  return transporter.sendMail(mailOptions);
};

// Generate a random 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP for delivery or return verification
export const sendDeliveryReturnOTP = async (email, otp, userName, productTitle, isDelivery) => {
  const action = isDelivery ? 'Delivery' : 'Return';
  const subject = `🔐 ${action} Verification OTP - ${productTitle}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${action} Verification OTP</title>
      <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 40px; }
        .otp-box { background: #f0fdf4; border: 2px solid #10b981; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 32px; font-weight: bold; color: #10b981; letter-spacing: 4px; margin: 10px 0; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 ${action} Verification</h1>
          <p>Secure ${action.toLowerCase()} verification required</p>
        </div>
        
        <div class="content">
          <h2>Hello ${userName},</h2>
          
          <p>Please use the following verification code to confirm the ${action.toLowerCase()} of <strong>${productTitle}</strong>.</p>
          
          <div class="otp-box">
            <h3>Your verification code is:</h3>
            <div class="otp-code">${otp}</div>
            <p><strong>Valid for 10 minutes</strong></p>
          </div>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong><br>
            • This code is for ${action.toLowerCase()} verification only<br>
            • Never share this code with anyone except the ${isDelivery ? 'renter' : 'owner'}<br>
            • If you didn't request this, please contact support immediately<br>
            • Code expires in 10 minutes for security
          </div>
          
          <p>If you're having trouble with the ${action.toLowerCase()} process, please contact our support team.</p>
          
          <p>Best regards,<br>
          <strong>Rental Management Team</strong></p>
        </div>
        
        <div class="footer">
          <p>This is an automated security email for ${action.toLowerCase()} verification.</p>
          <p>© ${new Date().getFullYear()} Rental Management System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    ${action} Verification Required
    
    Hello ${userName},
    
    Your ${action.toLowerCase()} verification code for ${productTitle} is: ${otp}
    
    This code is valid for 10 minutes.
    
    For security reasons:
    - Never share this code with anyone except the ${isDelivery ? 'renter' : 'owner'}
    - Only use this code for ${action.toLowerCase()} verification
    - Contact support if you didn't request this
    
    Best regards,
    Rental Management Team
  `;

  return sendEmail({
    to: email,
    subject,
    text,
    html
  });
};

// Send Admin OTP for secure login
export const sendAdminOTP = async (email, otp, adminName) => {
  const subject = '🔐 Admin Login Verification - OTP Required';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Admin Login OTP</title>
      <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #dc2626, #ea580c); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 40px; }
        .otp-box { background: #fee2e2; border: 2px solid #dc2626; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 32px; font-weight: bold; color: #dc2626; letter-spacing: 4px; margin: 10px 0; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
        .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Admin Access Verification</h1>
          <p>Secure login verification required</p>
        </div>
        
        <div class="content">
          <h2>Hello ${adminName || 'Administrator'},</h2>
          
          <p>We received a request to access the admin panel for your Rental Management account.</p>
          
          <div class="otp-box">
            <h3>Your verification code is:</h3>
            <div class="otp-code">${otp}</div>
            <p><strong>Valid for 10 minutes</strong></p>
          </div>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong><br>
            • This code is for admin access only<br>
            • Never share this code with anyone<br>
            • If you didn't request this, please contact support immediately<br>
            • Code expires in 10 minutes for security
          </div>
          
          <p>If you're having trouble accessing the admin panel, please contact our support team.</p>
          
          <p>Best regards,<br>
          <strong>Rental Management Security Team</strong></p>
        </div>
        
        <div class="footer">
          <p>This is an automated security email for admin verification.</p>
          <p>© ${new Date().getFullYear()} Rental Management System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Admin Login Verification Required
    
    Hello ${adminName || 'Administrator'},
    
    Your admin verification code is: ${otp}
    
    This code is valid for 10 minutes.
    
    For security reasons:
    - Never share this code with anyone
    - Only use this code if you requested admin access
    - Contact support if you didn't request this
    
    Best regards,
    Rental Management Security Team
  `;

  return sendEmail({ to: email, subject, text, html });
};