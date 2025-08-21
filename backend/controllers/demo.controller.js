import NotificationService from '../services/notification.service.js'

// Demo notifications seeder
export const seedDemoNotifications = async (userClerkId) => {
  try {
    console.log('Seeding demo notifications for user:', userClerkId)
    
    // Rental request notification
    await NotificationService.createRentalRequestNotification({
      renterId: 'demo-renter-123',
      ownerId: userClerkId,
      productId: 'demo-product-456',
      productTitle: 'Professional DSLR Camera Kit',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      totalAmount: 450.00
    })
    
    // Payment confirmation notification
    await NotificationService.createPaymentConfirmationNotification({
      userId: null, // Will be populated by the service
      userClerkId,
      amount: 89.99,
      method: 'Credit Card',
      bookingId: 'demo-booking-789',
      productTitle: 'Mountain Bike - Trek X-Caliber 8'
    })
    
    // Pickup scheduled notification
    await NotificationService.createPickupScheduledNotification({
      userId: null,
      userClerkId,
      productTitle: 'Camping Gear Bundle - Family Size',
      pickupLocation: '555 Outdoor Gear St, Denver, CO 80202',
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      bookingId: 'demo-booking-101'
    })
    
    // Drop-off scheduled notification
    await NotificationService.createDropScheduledNotification({
      userId: null,
      userClerkId,
      productTitle: 'Electric Guitar with Amplifier',
      dropLocation: '777 Music Row, Nashville, TN 37203',
      scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      bookingId: 'demo-booking-102'
    })
    
    // Due payment notification
    await NotificationService.createDuePaymentNotification({
      userId: null,
      userClerkId,
      amount: 75.00,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (overdue)
      productTitle: 'Power Tool Set - Professional Grade',
      bookingId: 'demo-booking-103'
    })
    
    // System notification
    await NotificationService.createSystemNotification({
      userId: null,
      userClerkId,
      message: 'Your account has been verified! You can now list unlimited products.',
      metadata: {
        verificationDate: new Date(),
        accountType: 'premium'
      }
    })
    
    // Promotional notification
    await NotificationService.createPromotionNotification({
      userId: null,
      userClerkId,
      message: '🎉 Special offer: List 5 products this week and get 20% off listing fees!',
      metadata: {
        discount: 20,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        promoCode: 'LIST5SAVE20'
      }
    })
    
    // Reminder notification
    await NotificationService.createReminderNotification({
      userId: null,
      userClerkId,
      message: 'Don\'t forget to return your rented item "Gaming Laptop - High Performance" by tomorrow',
      relatedId: 'demo-booking-104',
      relatedType: 'booking',
      metadata: {
        productTitle: 'Gaming Laptop - High Performance',
        returnDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        reminderType: 'return_reminder'
      }
    })
    
    // Booking status notification
    await NotificationService.createBookingStatusNotification({
      userId: null,
      userClerkId,
      status: 'confirmed',
      productTitle: 'Pro Tennis Racket - Tournament Ready',
      bookingId: 'demo-booking-105'
    })
    
    console.log('Demo notifications seeded successfully!')
    
  } catch (error) {
    console.error('Error seeding demo notifications:', error)
  }
}

// Endpoint to trigger demo notifications
export const createDemoNotifications = async (req, res) => {
  try {
    const { userClerkId } = req.body
    
    if (!userClerkId) {
      return res.status(400).json({
        success: false,
        message: 'userClerkId is required'
      })
    }
    
    await seedDemoNotifications(userClerkId)
    
    res.json({
      success: true,
      message: 'Demo notifications created successfully'
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create demo notifications',
      error: error.message
    })
  }
}
