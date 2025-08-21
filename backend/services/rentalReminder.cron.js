import cron from 'node-cron';
import Booking from '../models/booking.model.js';
import User from '../models/user.js';
import Product from '../models/product.model.js';
import { sendReminderEmail, testEmailConnection } from './emailReminder.service.js';

class RentalReminderCron {
  constructor() {
    this.isRunning = false;
    this.init();
  }

  async init() {
    // Test email connection on startup
    const emailReady = await testEmailConnection();
    if (!emailReady) {
      console.error('❌ Email service not ready. Cron job will still run but emails may fail.');
    }

    // Schedule cron job to run every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      if (this.isRunning) {
        console.log('⏳ Previous cron job still running, skipping...');
        return;
      }

      this.isRunning = true;
      console.log('\n🔄 Running rental reminder cron job...', new Date().toISOString());
      
      try {
        await this.processRentalReminders();
      } catch (error) {
        console.error('❌ Error in rental reminder cron job:', error);
      } finally {
        this.isRunning = false;
        console.log('✅ Rental reminder cron job completed\n');
      }
    });

    console.log('🚀 Rental reminder cron job scheduled (every 5 minutes)');
  }

  async processRentalReminders() {
    const now = new Date();
    
    // Find active bookings that might need reminders
    const activeBookings = await Booking.find({
      status: { $in: ['confirmed', 'in_rental'] },
      $or: [
        { reminderSent: { $ne: true } },
        { deadlineSent: { $ne: true } },
        { warningSent: { $ne: true } }
      ]
    })
    .populate('renterId', 'email firstName lastName')
    .populate('productId', 'name')
    .lean();

    console.log(`📋 Found ${activeBookings.length} active bookings to process`);

    let processedCount = 0;
    
    for (const booking of activeBookings) {
      try {
        const endDate = new Date(booking.endDate);
        const timeDiff = endDate.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        const minutesDiff = timeDiff / (1000 * 60);

        let emailSent = false;

        // 1. Reminder email: 6 hours before endDate
        if (!booking.reminderSent && hoursDiff <= 6 && hoursDiff > 0) {
          await this.sendReminder(booking, 'reminder');
          await this.updateBookingFlag(booking._id, 'reminderSent', true);
          emailSent = true;
          console.log(`📧 Reminder email sent for booking ${booking._id}`);
        }

        // 2. Deadline email: exactly at or after endDate (but before 30 min overdue)
        if (!booking.deadlineSent && timeDiff <= 0 && minutesDiff >= -30) {
          await this.sendReminder(booking, 'deadline');
          await this.updateBookingFlag(booking._id, 'deadlineSent', true);
          emailSent = true;
          console.log(`⏰ Deadline email sent for booking ${booking._id}`);
        }

        // 3. Warning email: 30 minutes after endDate
        if (!booking.warningSent && minutesDiff <= -30) {
          await this.sendReminder(booking, 'warning');
          await this.updateBookingFlag(booking._id, 'warningSent', true);
          
          // Also update return status to 'late' if not already set
          if (booking.returnStatus !== 'late') {
            await Booking.findByIdAndUpdate(booking._id, { 
              returnStatus: 'late' 
            });
            console.log(`⚠️ Updated booking ${booking._id} status to 'late'`);
          }
          
          emailSent = true;
          console.log(`🚨 Warning email sent for booking ${booking._id}`);
        }

        if (emailSent) {
          processedCount++;
        }

      } catch (error) {
        console.error(`❌ Error processing booking ${booking._id}:`, error);
      }
    }

    console.log(`✅ Processed ${processedCount} reminders successfully`);
  }

  async sendReminder(booking, type) {
    try {
      if (!booking.renterId || !booking.renterId.email) {
        console.error(`❌ No email found for booking ${booking._id}`);
        return;
      }

      const emailData = {
        renterName: booking.renterId.firstName 
          ? `${booking.renterId.firstName} ${booking.renterId.lastName || ''}`.trim()
          : 'Valued Customer',
        productName: booking.productId?.name || 'Rental Item',
        endDate: booking.endDate,
        bookingId: booking._id
      };

      const result = await sendReminderEmail(
        booking.renterId.email,
        type,
        emailData
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      return result;
    } catch (error) {
      console.error(`❌ Failed to send ${type} email for booking ${booking._id}:`, error);
      throw error;
    }
  }

  async updateBookingFlag(bookingId, flag, value) {
    try {
      await Booking.findByIdAndUpdate(bookingId, { [flag]: value });
      console.log(`✅ Updated ${flag} to ${value} for booking ${bookingId}`);
    } catch (error) {
      console.error(`❌ Failed to update ${flag} for booking ${bookingId}:`, error);
      throw error;
    }
  }

  // Manual trigger for testing
  async triggerManually() {
    console.log('🔧 Manually triggering rental reminder job...');
    await this.processRentalReminders();
  }

  // Get statistics
  async getStats() {
    try {
      const stats = await Booking.aggregate([
        {
          $match: {
            status: { $in: ['confirmed', 'in_rental'] }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            remindersSent: { $sum: { $cond: ['$reminderSent', 1, 0] } },
            deadlinesSent: { $sum: { $cond: ['$deadlineSent', 1, 0] } },
            warningsSent: { $sum: { $cond: ['$warningSent', 1, 0] } }
          }
        }
      ]);

      return stats[0] || { 
        total: 0, 
        remindersSent: 0, 
        deadlinesSent: 0, 
        warningsSent: 0 
      };
    } catch (error) {
      console.error('❌ Error getting reminder stats:', error);
      return null;
    }
  }
}

// Create and export singleton instance
const rentalReminderCron = new RentalReminderCron();

export default rentalReminderCron;
