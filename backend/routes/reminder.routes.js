import express from 'express';
import rentalReminderCron from '../services/rentalReminder.cron.js';

const router = express.Router();

// Manual trigger for testing
router.post('/trigger', async (req, res) => {
  try {
    console.log('📧 Manual trigger requested for rental reminders');
    await rentalReminderCron.triggerManually();
    
    res.status(200).json({
      success: true,
      message: 'Rental reminder job triggered successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error triggering rental reminders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger rental reminders',
      error: error.message
    });
  }
});

// Get reminder statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await rentalReminderCron.getStats();
    
    res.status(200).json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error getting reminder stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reminder statistics',
      error: error.message
    });
  }
});

// Test email configuration
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    // Import email service for testing
    const { sendReminderEmail } = await import('../services/emailReminder.service.js');
    
    const testData = {
      renterName: 'Test User',
      productName: 'Test Product',
      endDate: new Date(),
      bookingId: 'TEST123'
    };

    const result = await sendReminderEmail(email, 'reminder', testData);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Test email sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Error sending test email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
});

export default router;
