import Payment from "../models/payment.model.js";
import Booking from "../models/booking.model.js";
import User from "../models/user.js";
import Stripe from "stripe";
import { sendEmail } from '../services/email.service.js';
import { createInvoiceForBooking } from './invoice.controller.js';
import { createStripePaymentIntent, confirmStripePayment } from '../services/payment.service.js';
import NotificationService from '../services/notification.service.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});

export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate("bookingId renterId ownerId");
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch payments", error: error.message });
  }
};

// Test payment methods configuration
export const testPaymentMethods = async (req, res) => {
  try {
    const { amount = 5000, currency = 'inr' } = req.body;
    
    // Create a test payment intent to see available methods
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'always'
      },
      metadata: {
        test: 'true',
        purpose: 'payment_method_testing'
      }
    });
    
    // Get account information
    const account = await stripe.accounts.retrieve();
    
    res.json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        payment_method_types: paymentIntent.payment_method_types,
        automatic_payment_methods: paymentIntent.automatic_payment_methods
      },
      account: {
        id: account.id,
        country: account.country,
        default_currency: account.default_currency,
        capabilities: account.capabilities
      },
      configuredMethods: 'automatic (all enabled methods)',
      testCards: [
        { type: 'Visa', number: '4242 4242 4242 4242', note: 'Add to Google Pay for testing' },
        { type: 'Visa (debit)', number: '4000 0566 5566 5556', note: 'Good for Google Pay testing' },
        { type: 'Mastercard', number: '5555 5555 5555 4444', note: 'Works with Google Pay' },
        { type: 'Mastercard (debit)', number: '5200 8282 8282 8210', note: 'India-specific testing' },
        { type: 'American Express', number: '3782 822463 10005', note: 'Premium card testing' },
        { type: 'Discover', number: '6011 1111 1111 1117', note: 'US market testing' },
        { type: 'JCB', number: '3566 0020 2036 0505', note: 'Asia-Pacific testing' },
        { type: 'Diners Club', number: '3056 9300 0902 0004', note: 'Corporate card testing' }
      ],
      digitalWallets: {
        googlePay: {
          supported: true,
          requirements: ['Chrome browser', 'Android device with Google Pay', 'Test cards in Google Pay'],
          testing: 'Add test cards (4242...) to your Google Pay account for testing'
        },
        applePay: {
          supported: true,
          requirements: ['Safari browser', 'iOS device', 'macOS with Touch ID'],
          testing: 'Available automatically on supported Apple devices'
        },
        paypal: {
          supported: true,
          methodId: 'cpmt_1Rv31gGzgYJAvIRf9aIhMlIm',
          testing: 'Use PayPal sandbox account for testing'
        }
      }
    });
  } catch (error) {
    console.error('Error testing payment methods:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to test payment methods', 
      error: error.message 
    });
  }
};

// Initiate payment for a booking
export const initiatePayment = async (req, res) => {
  try {
    const { id } = req.params; // bookingId
    
    const booking = await Booking.findById(id).populate('productId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    // Check if payment is already initiated
    const existingPayment = await Payment.findOne({ bookingId: booking._id, status: { $in: ['completed', 'processing'] } });
    if (existingPayment) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment already initiated for this booking',
        paymentIntent: {
          id: existingPayment.gatewayPaymentId,
          client_secret: existingPayment.clientSecret,
          amount: existingPayment.amount * 100, // Convert to cents for frontend
          currency: existingPayment.currency
        }
      });
    }
    
    // Validate minimum amount (Stripe requires at least 50 INR for INR currency)
    const minimumAmount = 50; // ₹50 minimum
    let paymentAmount = booking.totalPrice;
    
    if (paymentAmount < minimumAmount) {
      console.log(`Amount ${paymentAmount} is below minimum ${minimumAmount}, adjusting to minimum`);
      paymentAmount = minimumAmount;
    }
    
    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(paymentAmount * 100), // Convert to cents (paise for INR)
      currency: 'inr',
      metadata: {
        bookingId: booking._id.toString(),
        productId: booking.productId._id.toString(),
        renterId: booking.renterId.toString(),
        ownerId: booking.ownerId.toString(),
        originalAmount: booking.totalPrice.toString(),
        adjustedAmount: paymentAmount.toString()
      },
      // Use automatic_payment_methods to enable all available methods including Google Pay
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'always' // Allow redirects for PayPal and other redirect-based methods
      },
      // Additional configuration for better payment method support
      shipping: {
        address: {
          country: 'IN', // Set default country to India for better regional support
        },
        name: booking.renterName || 'Customer'
      },
      // Ensure proper setup for digital wallets
      description: `Rental payment for ${booking.productId?.name || 'product'}`,
      // Use statement_descriptor_suffix instead of statement_descriptor for cards
      statement_descriptor_suffix: 'RENTAL',
    });
    
    // Create a pending payment record
    await Payment.create({
      bookingId: booking._id,
      renterId: booking.renterId,
      renterClerkId: booking.renterClerkId,
      ownerId: booking.ownerId,
      ownerClerkId: booking.ownerClerkId,
      paymentGateway: 'stripe',
      gatewayPaymentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: paymentAmount, // Use adjusted amount
      currency: 'inr',
      platformFee: booking.platformFee,
      ownerAmount: booking.ownerAmount,
      status: 'pending'
    });
    
    // Return the payment intent details to the client
    res.json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      },
      originalAmount: booking.totalPrice,
      adjustedAmount: paymentAmount,
      isAmountAdjusted: paymentAmount !== booking.totalPrice,
      minimumRequired: minimumAmount
    });
  } catch (error) {
    console.error('Error initiating payment:', error);
    res.status(500).json({ success: false, message: 'Failed to initiate payment', error: error.message });
  }
};

// Confirm payment for a booking
export const confirmPayment = async (req, res) => {
  try {
    const { id } = req.params; // bookingId
    const { paymentIntentId } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({ success: false, message: 'Payment intent ID is required' });
    }
    
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    // Check if payment is already completed
    const existingPayment = await Payment.findOne({ 
      gatewayPaymentId: paymentIntentId,
      status: 'completed'
    });
    
    if (existingPayment) {
      console.log('Payment already completed:', paymentIntentId);
      return res.json({
        success: true,
        message: 'Payment already completed',
        payment: existingPayment,
        booking: booking
      });
    }
    
    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    // Verify payment status
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ 
        success: false, 
        message: `Payment not completed. Status: ${paymentIntent.status}` 
      });
    }
    
    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { gatewayPaymentId: paymentIntentId },
      { 
        status: 'completed',
        gatewayChargeId: paymentIntent.latest_charge,
        paymentDate: new Date()
      },
      { new: true }
    );
    
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }
    
    // Update booking status only if not already updated
    if (booking.paymentStatus !== 'paid') {
      booking.status = 'confirmed'; // Use valid enum value
      booking.paymentStatus = 'paid'; // Use valid enum value
      await booking.save();
    }
    
    // Generate invoice
    const invoice = await createInvoiceForBooking(booking._id);
    
    // Send confirmation emails
    const populatedBooking = await Booking.findById(booking._id)
      .populate('productId')
      .populate('renterId')
      .populate('ownerId');
      
    // Send payment confirmation emails to renter
    await sendPaymentConfirmationEmail(populatedBooking, payment);

    // Send pickup notification to owner (in-site notification)
    try {
      await NotificationService.createPaymentConfirmationPickupNotification({
        ownerId: populatedBooking.ownerId._id,
        ownerClerkId: populatedBooking.ownerClerkId,
        renterName: `${populatedBooking.renterId?.firstName || ''} ${populatedBooking.renterId?.lastName || ''}`.trim() || 'Customer',
        productTitle: populatedBooking.productId?.name || 'Product',
        amount: payment.amount,
        startDate: populatedBooking.startDate,
        endDate: populatedBooking.endDate,
        bookingId: populatedBooking._id
      });
      console.log('Pickup notification sent to owner');
    } catch (notificationError) {
      console.error('Failed to send pickup notification:', notificationError);
    }

    // Send email notification to owner
    try {
      const ownerEmail = populatedBooking.ownerId?.email;
      const renterName = `${populatedBooking.renterId?.firstName || ''} ${populatedBooking.renterId?.lastName || ''}`.trim() || 'Customer';
      const productName = populatedBooking.productId?.name || 'Product';
      const pickupDate = new Date(populatedBooking.startDate).toLocaleDateString('en-IN');
      const returnDate = new Date(populatedBooking.endDate).toLocaleDateString('en-IN');

      if (ownerEmail) {
        await sendEmail({
          to: ownerEmail,
          subject: `🎉 Payment Received - Prepare for Pickup | ${productName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 28px;">💰 Payment Received!</h1>
                <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Your rental item has been paid for</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  <h2 style="color: #333; margin-top: 0; margin-bottom: 20px;">📋 Rental Details</h2>
                  <div style="border-left: 4px solid #28a745; padding-left: 15px; margin-bottom: 15px;">
                    <p style="margin: 5px 0;"><strong>Product:</strong> ${productName}</p>
                    <p style="margin: 5px 0;"><strong>Renter:</strong> ${renterName}</p>
                    <p style="margin: 5px 0;"><strong>Amount Paid:</strong> ₹${payment.amount}</p>
                    <p style="margin: 5px 0;"><strong>Pickup Date:</strong> ${pickupDate}</p>
                    <p style="margin: 5px 0;"><strong>Return Date:</strong> ${returnDate}</p>
                    <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${populatedBooking._id.toString().slice(-8).toUpperCase()}</p>
                  </div>
                </div>

                <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  <h3 style="color: #333; margin-top: 0;">📦 Next Steps</h3>
                  <ul style="color: #666; line-height: 1.6;">
                    <li>Prepare your item for pickup on <strong>${pickupDate}</strong></li>
                    <li>Download the pickup document for reference</li>
                    <li>Verify renter's identity during pickup</li>
                    <li>Inspect the item condition together</li>
                    <li>Keep the pickup document for your records</li>
                  </ul>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="http://localhost:5173/notifications" 
                     style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 10px;">
                    📱 View Notifications
                  </a>
                  <a href="http://localhost:3000/api/invoices/booking/${populatedBooking._id}/pickup-document" 
                     style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 10px;">
                    📄 Download Pickup Document
                  </a>
                </div>

                <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196f3;">
                  <h4 style="color: #1976d2; margin-top: 0;">💡 Important Reminders</h4>
                  <p style="color: #666; margin-bottom: 0; line-height: 1.5;">
                    • Please be available during the pickup time<br>
                    • Bring a valid ID for verification<br>
                    • Contact the renter if you need to reschedule<br>
                    • Report any issues immediately through the platform
                  </p>
                </div>

                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                  <p style="color: #888; font-size: 14px; margin: 0;">
                    Thank you for using Rental Management System!<br>
                    <a href="mailto:support@rentalmanagement.com" style="color: #007bff;">Contact Support</a> if you need assistance.
                  </p>
                </div>
              </div>
            </div>
          `
        });
        console.log('Payment confirmation email sent to owner:', ownerEmail);
      }
    } catch (emailError) {
      console.error('Failed to send email notification to owner:', emailError);
    }
    
    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      booking,
      payment,
      invoice
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ success: false, message: 'Failed to confirm payment', error: error.message });
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId).populate("bookingId renterId ownerId");
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch payment", error: error.message });
  }
};

// Stripe webhook handler
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await handlePaymentSuccess(paymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        await handlePaymentFailure(failedPayment);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

// Send payment confirmation email
const sendPaymentConfirmationEmail = async (booking, payment) => {
  try {
    const { renterId, ownerId, productId, startDate, endDate, totalPrice, ownerAmount } = booking;
    
    // Get renter and owner details
    const [renter, owner] = await Promise.all([
      User.findById(renterId),
      User.findById(ownerId)
    ]);
    
    if (!renter || !owner) {
      console.error('Could not find renter or owner for payment confirmation email');
      return;
    }
    
    // Format dates
    const formattedStartDate = new Date(startDate).toLocaleDateString();
    const formattedEndDate = new Date(endDate).toLocaleDateString();
    
    // Send email to renter
    await sendEmail({
      to: renter.email,
      subject: 'Payment Confirmation - Your Rental is Confirmed!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Payment Confirmation</title>
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 40px; }
            .booking-details { background: #f0fdf4; border: 1px solid #d1fae5; border-radius: 10px; padding: 20px; margin: 20px 0; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Confirmation</h1>
              <p>Your rental is confirmed!</p>
            </div>
            
            <div class="content">
              <h2>Hello ${renter.firstName || renter.username},</h2>
              
              <p>Your payment of ₹${totalPrice} has been successfully processed. Your rental is now confirmed!</p>
              
              <div class="booking-details">
                <h3>Booking Details:</h3>
                <p><strong>Product:</strong> ${productId.title}</p>
                <p><strong>Rental Period:</strong> ${formattedStartDate} to ${formattedEndDate}</p>
                <p><strong>Owner:</strong> ${owner.firstName || owner.username}</p>
                <p><strong>Total Amount Paid:</strong> ₹${totalPrice}</p>
                <p><strong>Payment ID:</strong> ${payment.gatewayPaymentId}</p>
              </div>
              
              <p>An invoice has been generated and is available in your account. You can also download it from the booking details page.</p>
              
              <p>If you have any questions about your rental, please contact us or the owner directly.</p>
              
              <p>Thank you for using our platform!</p>
              
              <p>Best regards,<br>
              <strong>Rental Management Team</strong></p>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} Rental Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
    
    // Send email to owner
    await sendEmail({
      to: owner.email,
      subject: 'New Rental Payment Received',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>New Rental Payment</title>
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 40px; }
            .booking-details { background: #f0fdf4; border: 1px solid #d1fae5; border-radius: 10px; padding: 20px; margin: 20px 0; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Rental Payment</h1>
              <p>You've received a payment for your rental item</p>
            </div>
            
            <div class="content">
              <h2>Hello ${owner.firstName || owner.username},</h2>
              
              <p>Good news! A payment of ₹${ownerAmount} (after platform fee) has been received for your rental item.</p>
              
              <div class="booking-details">
                <h3>Booking Details:</h3>
                <p><strong>Product:</strong> ${productId.title}</p>
                <p><strong>Rental Period:</strong> ${formattedStartDate} to ${formattedEndDate}</p>
                <p><strong>Renter:</strong> ${renter.firstName || renter.username}</p>
                <p><strong>Total Rental Amount:</strong> ₹${totalPrice}</p>
                <p><strong>Your Earnings (after platform fee):</strong> ₹${ownerAmount}</p>
              </div>
              
              <p>Please prepare the item for pickup according to the agreed schedule. The funds will be transferred to your account after the rental is confirmed.</p>
              
              <p>Thank you for using our platform!</p>
              
              <p>Best regards,<br>
              <strong>Rental Management Team</strong></p>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} Rental Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
    
    console.log('Payment confirmation emails sent successfully');
  } catch (error) {
    console.error('Error sending payment confirmation emails:', error);
  }
};

// Handle successful payment
const handlePaymentSuccess = async (paymentIntent) => {
  try {
    const { bookingId } = paymentIntent.metadata;
    
    if (!bookingId) {
      console.error('No booking ID in payment metadata');
      return;
    }

    const booking = await Booking.findById(bookingId).populate('productId renterId ownerId');
    if (!booking) {
      console.error('Booking not found for payment:', bookingId);
      return;
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ gatewayPaymentId: paymentIntent.id });
    if (existingPayment) {
      console.log('Payment already processed:', paymentIntent.id);
      return;
    }

    // Create payment record
    const payment = await Payment.create({
      bookingId,
      renterId: booking.renterId,
      renterClerkId: booking.renterClerkId,
      ownerId: booking.ownerId,
      ownerClerkId: booking.ownerClerkId,
      paymentGateway: "stripe",
      gatewayPaymentId: paymentIntent.id,
      gatewayChargeId: paymentIntent.latest_charge,
      amount: paymentIntent.amount / 100, // Convert from cents
      currency: paymentIntent.currency,
      platformFee: booking.platformFee,
      ownerAmount: booking.ownerAmount,
      paymentStatus: "successful",
      paymentDate: new Date()
    });

    // Update booking
    booking.paymentStatus = "paid";
    booking.status = "confirmed";
    booking.paymentId = payment._id;
    await booking.save();

    // Send pickup notification to owner
    try {
      await NotificationService.createPaymentConfirmationPickupNotification({
        ownerId: booking.ownerId._id,
        ownerClerkId: booking.ownerClerkId,
        renterName: `${booking.renterId?.firstName || ''} ${booking.renterId?.lastName || ''}`.trim() || 'Customer',
        productTitle: booking.productId?.name || 'Product',
        amount: payment.amount,
        startDate: booking.startDate,
        endDate: booking.endDate,
        bookingId: booking._id
      });
      console.log('Pickup notification sent to owner');
    } catch (notificationError) {
      console.error('Failed to send pickup notification:', notificationError);
    }

    // Send email notification to owner
    try {
      const ownerEmail = booking.ownerId?.email;
      const renterName = `${booking.renterId?.firstName || ''} ${booking.renterId?.lastName || ''}`.trim() || 'Customer';
      const productName = booking.productId?.name || 'Product';
      const pickupDate = new Date(booking.startDate).toLocaleDateString('en-IN');
      const returnDate = new Date(booking.endDate).toLocaleDateString('en-IN');

      if (ownerEmail) {
        await sendEmail({
          to: ownerEmail,
          subject: `🎉 Payment Received - Prepare for Pickup | ${productName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 28px;">💰 Payment Received!</h1>
                <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Your rental item has been paid for</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  <h2 style="color: #333; margin-top: 0; margin-bottom: 20px;">📋 Rental Details</h2>
                  <div style="border-left: 4px solid #28a745; padding-left: 15px; margin-bottom: 15px;">
                    <p style="margin: 5px 0;"><strong>Product:</strong> ${productName}</p>
                    <p style="margin: 5px 0;"><strong>Renter:</strong> ${renterName}</p>
                    <p style="margin: 5px 0;"><strong>Amount Paid:</strong> ₹${payment.amount}</p>
                    <p style="margin: 5px 0;"><strong>Pickup Date:</strong> ${pickupDate}</p>
                    <p style="margin: 5px 0;"><strong>Return Date:</strong> ${returnDate}</p>
                    <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${booking._id.toString().slice(-8).toUpperCase()}</p>
                  </div>
                </div>

                <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  <h3 style="color: #333; margin-top: 0;">📦 Next Steps</h3>
                  <ul style="color: #666; line-height: 1.6;">
                    <li>Prepare your item for pickup on <strong>${pickupDate}</strong></li>
                    <li>Download the pickup document for reference</li>
                    <li>Verify renter's identity during pickup</li>
                    <li>Inspect the item condition together</li>
                    <li>Keep the pickup document for your records</li>
                  </ul>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="http://localhost:5174/notifications" 
                     style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 10px;">
                    📱 View Notifications
                  </a>
                  <a href="http://localhost:3000/api/invoices/booking/${booking._id}/pickup-document" 
                     style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 10px;">
                    📄 Download Pickup Document
                  </a>
                </div>

                <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196f3;">
                  <h4 style="color: #1976d2; margin-top: 0;">💡 Important Reminders</h4>
                  <p style="color: #666; margin-bottom: 0; line-height: 1.5;">
                    • Please be available during the pickup time<br>
                    • Bring a valid ID for verification<br>
                    • Contact the renter if you need to reschedule<br>
                    • Report any issues immediately through the platform
                  </p>
                </div>

                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                  <p style="color: #888; font-size: 14px; margin: 0;">
                    Thank you for using Rental Management System!<br>
                    <a href="mailto:support@rentalmanagement.com" style="color: #007bff;">Contact Support</a> if you need assistance.
                  </p>
                </div>
              </div>
            </div>
          `
        });
        console.log('Payment confirmation email sent to owner:', ownerEmail);
      }
    } catch (emailError) {
      console.error('Failed to send email notification to owner:', emailError);
    }

    console.log('Payment confirmed automatically for booking:', bookingId);
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
};

// Handle failed payment
const handlePaymentFailure = async (paymentIntent) => {
  try {
    const { bookingId } = paymentIntent.metadata;
    
    if (!bookingId) {
      console.error('No booking ID in payment metadata');
      return;
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      console.error('Booking not found for failed payment:', bookingId);
      return;
    }

    // Update booking status
    booking.paymentStatus = "unpaid";
    booking.status = "pending";
    await booking.save();

    console.log('Payment failed for booking:', bookingId);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
};
