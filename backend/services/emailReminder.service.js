import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your preferred email service
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS  // Your email password or app password
  }
});

// Email templates
const getEmailTemplate = (type, data) => {
  const { renterName, productName, endDate, bookingId } = data;
  
  const baseStyle = `
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
      .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
      .highlight { background: #e8f4fd; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0; }
      .warning { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
      .danger { background: #f8d7da; padding: 15px; border-left: 4px solid #dc3545; margin: 20px 0; }
      .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
      .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
  `;

  switch (type) {
    case 'reminder':
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Rental Return Reminder</title>
          ${baseStyle}
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Rental Return Reminder</h1>
              <p>Your rental period is ending soon!</p>
            </div>
            <div class="content">
              <h2>Hello ${renterName},</h2>
              <p>This is a friendly reminder that your rental period for <strong>${productName}</strong> is ending in approximately 6 hours.</p>
              
              <div class="highlight">
                <h3>📅 Rental Details:</h3>
                <ul>
                  <li><strong>Product:</strong> ${productName}</li>
                  <li><strong>End Date:</strong> ${new Date(endDate).toLocaleString()}</li>
                  <li><strong>Booking ID:</strong> ${bookingId}</li>
                </ul>
              </div>

              <h3>🚀 What you need to do:</h3>
              <ul>
                <li>Prepare the item for return</li>
                <li>Ensure the item is in good condition</li>
                <li>Contact us if you need to extend the rental period</li>
                <li>Schedule a pickup or return the item to our location</li>
              </ul>

              <a href="#" class="button">Manage Your Rental</a>

              <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            </div>
            <div class="footer">
              <p>Thank you for choosing our rental service!</p>
              <p>Best regards,<br>The Rental Team</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case 'deadline':
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Rental Period Ended</title>
          ${baseStyle}
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Rental Period Ended</h1>
              <p>Time to return your rental item</p>
            </div>
            <div class="content">
              <h2>Hello ${renterName},</h2>
              <p>Your rental period for <strong>${productName}</strong> has officially ended as of ${new Date(endDate).toLocaleString()}.</p>
              
              <div class="warning">
                <h3>⚠️ Important Notice:</h3>
                <p>Please return the item as soon as possible to avoid any late fees. Our team is ready to assist you with the return process.</p>
              </div>

              <div class="highlight">
                <h3>📋 Next Steps:</h3>
                <ol>
                  <li>Contact our team to schedule a pickup</li>
                  <li>Prepare the item for return</li>
                  <li>Ensure all accessories are included</li>
                  <li>Complete the return process promptly</li>
                </ol>
              </div>

              <a href="#" class="button">Schedule Return Pickup</a>

              <p><strong>Need more time?</strong> Contact us immediately to discuss extension options.</p>
            </div>
            <div class="footer">
              <p>Questions? Reach out to our support team anytime!</p>
              <p>Best regards,<br>The Rental Team</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case 'warning':
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>URGENT: Overdue Rental Warning</title>
          ${baseStyle}
        </head>
        <body>
          <div class="container">
            <div class="header" style="background: linear-gradient(135deg, #dc3545 0%, #bd2130 100%);">
              <h1>🚨 URGENT: Overdue Rental</h1>
              <p>Immediate action required!</p>
            </div>
            <div class="content">
              <h2>Hello ${renterName},</h2>
              <p>Your rental for <strong>${productName}</strong> is now <strong>OVERDUE</strong>. The rental period ended 30 minutes ago at ${new Date(endDate).toLocaleString()}.</p>
              
              <div class="danger">
                <h3>🚨 Overdue Notice:</h3>
                <ul>
                  <li>Late fees may now apply</li>
                  <li>Immediate return is required</li>
                  <li>Additional charges may be incurred for each day overdue</li>
                  <li>Failure to return may result in additional penalties</li>
                </ul>
              </div>

              <div class="highlight">
                <h3>🆘 Immediate Actions Required:</h3>
                <ol>
                  <li><strong>Call us immediately:</strong> [Your Phone Number]</li>
                  <li><strong>Return the item today</strong> to minimize late fees</li>
                  <li><strong>Contact support</strong> if there are any issues</li>
                </ol>
              </div>

              <a href="#" class="button" style="background: #dc3545;">Return Item Now</a>
              <a href="#" class="button" style="background: #28a745;">Contact Support</a>

              <p><strong style="color: #dc3545;">Time-sensitive:</strong> Please act immediately to avoid additional charges and maintain your good standing with our service.</p>
            </div>
            <div class="footer">
              <p style="color: #dc3545;"><strong>This is an urgent matter requiring immediate attention.</strong></p>
              <p>Support Team Available 24/7<br>The Rental Team</p>
            </div>
          </div>
        </body>
        </html>
      `;

    default:
      return '';
  }
};

// Send email function
export const sendReminderEmail = async (to, type, data) => {
  try {
    const subject = {
      reminder: '🔔 Rental Return Reminder - 6 Hours Left',
      deadline: '⏰ Rental Period Ended - Please Return Item',
      warning: '🚨 URGENT: Overdue Rental - Immediate Action Required'
    };

    const mailOptions = {
      from: `"Rental Management" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject[type],
      html: getEmailTemplate(type, data)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ ${type} email sent successfully to ${to}:`, result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error(`❌ Error sending ${type} email to ${to}:`, error);
    return { success: false, error: error.message };
  }
};

// Test email connection
export const testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email service is ready');
    return true;
  } catch (error) {
    console.error('❌ Email service error:', error);
    return false;
  }
};
