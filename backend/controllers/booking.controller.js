import Booking from "../models/booking.model.js";
import Payment from "../models/payment.model.js";
import User from "../models/user.js";
import Notification from "../models/notification.model.js";
import OTP from "../models/otp.model.js";
import NotificationService from "../services/notification.service.js";
import { createStripePaymentIntent, confirmStripePayment, createStripeTransfer, refundStripePayment } from "../services/payment.service.js";
import { sendEmail, generateOTP, sendDeliveryReturnOTP } from '../services/email.service.js';
import { createInvoiceForBooking } from './invoice.controller.js';
import mongoose from "mongoose";
import cron from 'node-cron';

// Check product availability for specific dates
export const checkProductAvailability = async (req, res) => {
  try {
    const { productId, startDate, endDate } = req.query;
    
    if (!productId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, start date, and end date are required'
      });
    }
    
    const requestStart = new Date(startDate);
    const requestEnd = new Date(endDate);
    
    // Check for overlapping bookings that are confirmed or paid
    const overlappingBookings = await Booking.find({
      productId: productId,
      status: { $in: ['confirmed', 'paid', 'accepted'] },
      paymentStatus: { $in: ['paid', 'confirmed'] },
      $or: [
        {
          startDate: { $lte: requestEnd },
          endDate: { $gte: requestStart }
        }
      ]
    });
    
    const isAvailable = overlappingBookings.length === 0;
    
    res.json({
      success: true,
      available: isAvailable,
      conflictingBookings: overlappingBookings.length,
      message: isAvailable 
        ? 'Product is available for the selected dates' 
        : 'Product is not available for the selected dates'
    });
  } catch (error) {
    console.error('Error checking product availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check product availability',
      error: error.message
    });
  }
};

// Get product availability calendar data
export const getProductAvailabilityCalendar = async (req, res) => {
  try {
    const { productId } = req.params;
    const { startMonth, endMonth } = req.query;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    // Set default date range (current month + 6 months)
    const now = new Date();
    const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 6, 0);
    
    const rangeStart = startMonth ? new Date(startMonth) : defaultStart;
    const rangeEnd = endMonth ? new Date(endMonth) : defaultEnd;
    
    // Get all bookings for this product within the date range
    const bookings = await Booking.find({
      productId: productId,
      status: { $in: ['confirmed', 'accepted', 'in_rental', 'pending_payment'] },
      paymentStatus: { $in: ['paid', 'pending'] },
      $or: [
        {
          startDate: { $gte: rangeStart, $lte: rangeEnd }
        },
        {
          endDate: { $gte: rangeStart, $lte: rangeEnd }
        },
        {
          startDate: { $lte: rangeStart },
          endDate: { $gte: rangeEnd }
        }
      ]
    }).select('startDate endDate status paymentStatus');
    
    // Format bookings for calendar
    const unavailablePeriods = bookings.map(booking => ({
      startDate: booking.startDate,
      endDate: booking.endDate,
      status: booking.status,
      paymentStatus: booking.paymentStatus
    }));
    
    res.json({
      success: true,
      productId,
      dateRange: {
        start: rangeStart,
        end: rangeEnd
      },
      unavailablePeriods,
      totalBookings: bookings.length
    });
  } catch (error) {
    console.error('Error getting product availability calendar:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get product availability calendar',
      error: error.message
    });
  }
};

// Calculate platform fee (10% default) and owner amount
const calculateAmounts = (totalPrice) => {
  const platformFee = Math.round(totalPrice * 0.1); // 10%
  const ownerAmount = totalPrice - platformFee;
  return { platformFee, ownerAmount };
};

// Send payment confirmation email
const sendPaymentConfirmationEmail = async (booking, payment) => {
  try {
    const { renterId, ownerId, productId, startDate, endDate, totalPrice } = booking;
    
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
              
              <p>Good news! A payment of ₹${booking.ownerAmount} (after platform fee) has been received for your rental item.</p>
              
              <div class="booking-details">
                <h3>Booking Details:</h3>
                <p><strong>Product:</strong> ${productId.title}</p>
                <p><strong>Rental Period:</strong> ${formattedStartDate} to ${formattedEndDate}</p>
                <p><strong>Renter:</strong> ${renter.firstName || renter.username}</p>
                <p><strong>Total Rental Amount:</strong> ₹${totalPrice}</p>
                <p><strong>Your Earnings (after platform fee):</strong> ₹${booking.ownerAmount}</p>
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

// Get booking by ID
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findById(id)
      .populate('productId', 'title category brand pricePerDay')
      .populate('renterId', 'username email firstName lastName')
      .populate('ownerId', 'username email firstName lastName');
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }
    
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch booking', 
      error: error.message 
    });
  }
};

// List bookings with optional filters (by clerkId, role, status, pagination)
export const listBookings = async (req, res) => {
  try {
    const { clerkId, role, status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (clerkId) {
      if (role === 'owner') filter.ownerClerkId = clerkId;
      else if (role === 'renter') filter.renterClerkId = clerkId;
      else filter.$or = [{ ownerClerkId: clerkId }, { renterClerkId: clerkId }];
    }
    if (status) filter.status = status;

    const numericLimit = Math.min(Number(limit) || 20, 100);
    const numericPage = Math.max(Number(page) || 1, 1);

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .sort({ createdAt: -1 })
        .limit(numericLimit)
        .skip((numericPage - 1) * numericLimit)
        .populate('productId', 'title category')
        .lean(),
      Booking.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      bookings,
      pagination: {
        page: numericPage,
        limit: numericLimit,
        total,
        pages: Math.ceil(total / numericLimit),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch bookings', error: error.message });
  }
};

// Create rental request with automatic pricing calculation
export const createRentalRequest = async (req, res) => {
  try {
    const { 
      productId, 
      productTitle,
      ownerClerkId, 
      renterClerkId, 
      startDate, 
      endDate, 
      notes,
      pricing 
    } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({ 
        success: false, 
        message: "Start date cannot be in the past" 
      });
    }

    if (start >= end) {
      return res.status(400).json({ 
        success: false, 
        message: "End date must be after start date" 
      });
    }

    // Find renter and owner
    const [renter, owner] = await Promise.all([
      User.findOne({ clerkId: renterClerkId }),
      User.findOne({ clerkId: ownerClerkId })
    ]);

    if (!renter || !owner) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Calculate platform fee and owner amount
    const { platformFee, ownerAmount } = calculateAmounts(pricing.total);

    // Create booking with pending approval status
    const booking = await Booking.create({
      productId,
      renterId: renter._id,
      renterClerkId,
      ownerId: owner._id,
      ownerClerkId,
      startDate: start,
      endDate: end,
      totalPrice: pricing.total,
      platformFee,
      ownerAmount,
      status: "requested",
      paymentStatus: "unpaid",
      notes: notes || ''
    });

    // Create notification for owner about rental request
    try {
      await NotificationService.createRentalRequestNotification({
        renterId: renterClerkId,
        ownerId: ownerClerkId,
        productId,
        productTitle: productTitle || 'Product',
        startDate: startDate,
        endDate: endDate,
        totalAmount: pricing.total,
        bookingId: booking._id
      });
    } catch (notificationError) {
      console.error('Failed to create rental request notification:', notificationError);
    }

    // Send email notification to owner
    try {
      await sendEmail({
        to: owner.email,
        subject: `New Rental Request for ${productTitle}`,
        html: `
          <h2>New Rental Request</h2>
          <p>You have received a new rental request for your product: <strong>${productTitle}</strong></p>
          <p><strong>Renter:</strong> ${renter.firstName} ${renter.lastName}</p>
          <p><strong>Duration:</strong> ${start.toDateString()} to ${end.toDateString()}</p>
          <p><strong>Total Amount:</strong> ₹${pricing.total.toFixed(2)}</p>
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
          <p>Please log in to your dashboard to approve or reject this request.</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
    }

    res.status(201).json({ 
      success: true, 
      message: "Rental request sent successfully. The owner will be notified.",
      booking 
    });
  } catch (error) {
    console.error('Create rental request error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create rental request", 
      error: error.message 
    });
  }
};

// Create booking (rental request)
export const createBooking = async (req, res) => {
  try {
    const { productId, renterId, renterClerkId, ownerId, ownerClerkId, startDate, endDate, totalPrice, productTitle } = req.body;

    const { platformFee, ownerAmount } = calculateAmounts(totalPrice);

    const booking = await Booking.create({
      productId,
      renterId,
      renterClerkId,
      ownerId,
      ownerClerkId,
      startDate,
      endDate,
      totalPrice,
      platformFee,
      ownerAmount,
      status: "requested",
      paymentStatus: "unpaid"
    });

    // Create notification for owner about rental request
    try {
      await NotificationService.createRentalRequestNotification({
        renterId: renterClerkId,
        ownerId: ownerClerkId,
        productId,
        productTitle: productTitle || 'Product',
        startDate,
        endDate,
        totalAmount: totalPrice,
        bookingId: booking._id
      });
    } catch (notificationError) {
      console.error('Failed to create rental request notification:', notificationError);
    }

    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create booking", error: error.message });
  }
};

// Accept rental request (owner action)
export const acceptRentalRequest = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { ownerClerkId } = req.body;

    const booking = await Booking.findById(bookingId).populate('productId', 'title');
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.ownerClerkId !== ownerClerkId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (booking.status !== "requested") {
      return res.status(400).json({ success: false, message: "Booking already processed" });
    }

    // Update booking status
    booking.status = "pending_payment";
    await booking.save();

    // Create invoice for the approved booking
    let invoice = null;
    try {
      invoice = await createInvoiceForBooking(booking._id);
    } catch (invoiceError) {
      console.error('Failed to create invoice:', invoiceError);
      // Don't fail the approval if invoice creation fails
    }
    
    // Generate rental agreement document
    try {
      const documentService = await import('../services/document.service.js');
      const rentalAgreement = await documentService.generateRentalAgreement(booking._id);
      console.log('Rental agreement generated:', rentalAgreement?._id);
    } catch (documentError) {
      console.error('Failed to generate rental agreement:', documentError);
      // Continue even if document generation fails
    }

    // Notify renter that request was accepted and payment is needed
    try {
      console.log('Creating acceptance notification for booking:', booking._id)
      const acceptanceNotification = await NotificationService.createRentalAcceptanceNotification({
        renterId: booking.renterClerkId,
        ownerId: booking.ownerClerkId,
        productTitle: booking.productId?.title || 'Product',
        bookingId: booking._id,
        totalAmount: booking.totalPrice,
        invoiceId: invoice?._id
      });
      console.log('Acceptance notification created:', acceptanceNotification?._id)
    } catch (notificationError) {
      console.error('Failed to create acceptance notification:', notificationError);
      // Continue execution even if notification fails
    }

    res.json({ 
      success: true, 
      message: "Rental request accepted. Invoice has been generated.", 
      booking,
      invoice 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to accept rental request", error: error.message });
  }
};

// Reject rental request (owner action)
export const rejectRentalRequest = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { ownerClerkId, reason } = req.body;

    const booking = await Booking.findById(bookingId).populate('productId', 'title');
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.ownerClerkId !== ownerClerkId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (booking.status !== "requested") {
      return res.status(400).json({ success: false, message: "Booking already processed" });
    }

    // Update booking status
    booking.status = "rejected";
    booking.cancelReason = reason || "Rejected by owner";
    await booking.save();

    // Notify renter that request was rejected
    try {
      console.log('Creating rejection notification for booking:', booking._id)
      const rejectionNotification = await NotificationService.createRentalRejectionNotification({
        renterId: booking.renterClerkId,
        ownerId: booking.ownerClerkId,
        productTitle: booking.productId?.title || 'Product',
        bookingId: booking._id
      });
      console.log('Rejection notification created:', rejectionNotification?._id)
    } catch (notificationError) {
      console.error('Failed to create rejection notification:', notificationError);
      // Continue execution even if notification fails
    }

    res.json({ success: true, message: "Rental request rejected", booking });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to reject rental request", error: error.message });
  }
};

// Start payment for a booking - redirects to payment controller
export const initiateBookingPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    // Redirect to the payment controller's initiatePayment endpoint
    req.body.bookingId = bookingId;
    req.body.amount = booking.totalPrice;
    req.body.currency = 'inr';
    
    // Forward the request to the payment controller using axios
    const axios = (await import('axios')).default;
    const response = await axios.post(
      `${req.protocol}://${req.get('host')}/api/payments/initiate`,
      req.body
    );
    
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to initiate payment", error: error.message });
  }
};

// Confirm payment - redirects to payment controller
export const confirmBookingPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { paymentIntentId } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({ success: false, message: 'Payment intent ID is required' });
    }
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    if (booking.status !== "pending_payment") {
      return res.status(400).json({ success: false, message: "Booking is not ready for payment" });
    }
    
    // Redirect to the payment controller's confirmPayment endpoint
    req.body.bookingId = bookingId;
    
    // Forward the request to the payment controller using axios
    const axios = (await import('axios')).default;
    const response = await axios.post(
      `${req.protocol}://${req.get('host')}/api/payments/confirm`,
      req.body
    );
    
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ success: false, message: 'Failed to confirm payment', error: error.message });
  }
};

// Confirm pickup & payout
export const confirmPickup = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { ownerStripeAccountId } = req.body; // Owner's Stripe Connect account ID
    
    const booking = await Booking.findById(bookingId).populate("paymentId");
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    if (!ownerStripeAccountId) {
      return res.status(400).json({ 
        success: false, 
        message: "Owner Stripe account ID is required for payout" 
      });
    }

    booking.pickupStatus = "completed";
    booking.status = "in_rental";
    await booking.save();

    // Create transfer to owner (platform fee already deducted)
    try {
      const transfer = await createStripeTransfer(
        booking.ownerAmount,
        ownerStripeAccountId,
        {
          bookingId: bookingId,
          ownerId: booking.ownerId.toString(),
          type: "rental_payout"
        }
      );

      booking.payoutStatus = "completed";
      booking.payoutDate = new Date();
      booking.payoutTransactionId = transfer.id;
      await booking.save();

      // Create notification for renter
      await Notification.create({
        userId: booking.renterId,
        userClerkId: booking.renterClerkId,
        type: "pickup_scheduled",
        message: `Pickup confirmed for your rental`,
        relatedId: booking._id,
        relatedType: "booking"
      });

      res.json({ 
        success: true, 
        message: "Pickup confirmed & payout completed", 
        booking, 
        transfer 
      });
    } catch (transferError) {
      booking.payoutStatus = "failed";
      await booking.save();
      
      res.status(500).json({ 
        success: false, 
        message: "Pickup confirmed but payout failed", 
        error: transferError.message 
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to confirm pickup", error: error.message });
  }
};

// Generate OTP for delivery verification
export const generateDeliveryOTP = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { userType } = req.body; // 'owner' or 'renter'
    
    const booking = await Booking.findById(bookingId)
      .populate('productId', 'title')
      .populate('renterId', 'email firstName lastName username')
      .populate('ownerId', 'email firstName lastName username');
    
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    
    if (booking.status !== "confirmed" && booking.status !== "in_rental") {
      return res.status(400).json({ 
        success: false, 
        message: "Booking must be confirmed or in rental state for delivery verification" 
      });
    }
    
    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP valid for 10 minutes
    
    // Check if an active OTP already exists
    const existingOTP = await OTP.findOne({
      bookingId: booking._id,
      type: "delivery",
      expiresAt: { $gt: new Date() }
    });
    
    if (existingOTP) {
      // Update existing OTP
      existingOTP.otp = otp;
      existingOTP.expiresAt = expiresAt;
      existingOTP.ownerVerified = false;
      existingOTP.renterVerified = false;
      await existingOTP.save();
    } else {
      // Create new OTP record
      await OTP.create({
        bookingId: booking._id,
        otp,
        type: "delivery",
        expiresAt
      });
    }
    
    // Determine recipient based on userType
    const recipient = userType === 'owner' ? booking.ownerId : booking.renterId;
    const recipientName = recipient.firstName || recipient.username;
    
    // Send OTP via email
    await sendDeliveryReturnOTP(
      recipient.email,
      otp,
      recipientName,
      booking.productId.title,
      true // isDelivery = true
    );

    // Create notification for pickup request
    if (userType === 'renter') {
      // Renter is requesting pickup - notify owner
      await NotificationService.createPickupRequestNotification({
        ownerId: booking.ownerClerkId,
        renterId: booking.renterClerkId,
        productTitle: booking.productId.title,
        bookingId: booking._id,
        requestedBy: 'renter',
        pickupLocation: booking.pickupLocation || 'As specified'
      });
    } else {
      // Owner is initiating pickup process - notify renter
      await NotificationService.createPickupInitiationNotification({
        renterId: booking.renterClerkId,
        ownerId: booking.ownerClerkId,
        productTitle: booking.productId.title,
        bookingId: booking._id,
        pickupLocation: booking.pickupLocation || 'As specified'
      });
    }
    
    res.json({ 
      success: true, 
      message: `Delivery verification OTP sent to ${userType}`,
      expiresAt
    });
  } catch (error) {
    console.error('Error generating delivery OTP:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to generate delivery OTP", 
      error: error.message 
    });
  }
};

// Verify delivery OTP
export const verifyDeliveryOTP = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { otp, userType } = req.body; // 'owner' or 'renter'
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    
    // Find active OTP for this booking
    const otpRecord = await OTP.findOne({
      bookingId: booking._id,
      type: "delivery",
      otp,
      expiresAt: { $gt: new Date() }
    });
    
    if (!otpRecord) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid or expired OTP" 
      });
    }
    
    // Update verification status based on user type
    if (userType === 'owner') {
      otpRecord.ownerVerified = true;
    } else if (userType === 'renter') {
      otpRecord.renterVerified = true;
    } else {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid user type" 
      });
    }
    
    await otpRecord.save();
    
    // Check if both owner and renter have verified
    if (otpRecord.ownerVerified && otpRecord.renterVerified) {
      // Update booking status
      booking.deliveryStatus = "delivered";
      booking.deliveryDate = new Date();
      booking.status = "in_rental";
      booking.pickupStatus = "completed";
      booking.pickupDate = new Date();
      
      // Calculate owner payment amount (total - platform fee)
      const platformFeePercent = 0.05; // 5% platform fee
      const platformFee = booking.totalPrice * platformFeePercent;
      const ownerAmount = booking.totalPrice - platformFee;
      
      booking.platformFee = platformFee;
      booking.ownerAmount = ownerAmount;
      booking.payoutStatus = "processing";
      
      await booking.save();
      
      // Process payment to owner
      try {
        const ownerUser = await User.findById(booking.ownerId);
        if (ownerUser?.stripeAccountId) {
          const transfer = await createStripeTransfer(
            ownerAmount,
            ownerUser.stripeAccountId,
            {
              bookingId: booking._id.toString(),
              type: 'rental_payment',
              description: `Rental payment for ${booking.productId.title}`
            }
          );
          
          booking.payoutStatus = "completed";
          booking.payoutDate = new Date();
          await booking.save();
          
          console.log(`Payment of ₹${ownerAmount} transferred to owner:`, transfer.id);
        } else {
          console.log('Owner does not have Stripe account connected - payment pending');
          booking.payoutStatus = "failed";
          await booking.save();
        }
      } catch (paymentError) {
        console.error('Error processing owner payment:', paymentError);
        booking.payoutStatus = "failed";
        await booking.save();
      }
      
      // Create notifications
      await Promise.all([
        // Notify owner about delivery and payment
        Notification.create({
          userId: booking.ownerId,
          userClerkId: booking.ownerClerkId,
          type: "pickup_completed",
          message: `Product pickup completed! Payment of ₹${ownerAmount} has been ${booking.payoutStatus === 'completed' ? 'transferred to your account' : 'initiated'}`,
          relatedId: booking._id,
          relatedType: "booking"
        }),
        // Notify renter about pickup completion
        Notification.create({
          userId: booking.renterId,
          userClerkId: booking.renterClerkId,
          type: "pickup_completed",
          message: `Product pickup completed successfully! Rental period has started.`,
          relatedId: booking._id,
          relatedType: "booking"
        })
      ]);
      
      // Send email notifications
      try {
        const ownerUser = await User.findById(booking.ownerId);
        const renterUser = await User.findById(booking.renterId);
        const productData = await mongoose.model('Product').findById(booking.productId);
        
        // Email to owner
        if (ownerUser?.email) {
          await sendEmail(
            ownerUser.email,
            'Product Pickup Completed - Payment Processed',
            `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #7c3aed;">Pickup Completed Successfully!</h2>
              <p>Dear ${ownerUser.firstName || ownerUser.username},</p>
              <p>Great news! The pickup for your product <strong>${productData?.title}</strong> has been completed by both you and the renter.</p>
              
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #374151; margin-top: 0;">Payment Details:</h3>
                <p><strong>Total Rental Amount:</strong> ₹${booking.totalPrice}</p>
                <p><strong>Platform Fee (5%):</strong> ₹${platformFee.toFixed(2)}</p>
                <p><strong>Your Payment:</strong> ₹${ownerAmount.toFixed(2)}</p>
                <p><strong>Status:</strong> ${booking.payoutStatus === 'completed' ? '✅ Transferred to your account' : '⏳ Processing'}</p>
              </div>
              
              <p>The rental period has officially started. The renter is expected to return the product by <strong>${new Date(booking.endDate).toLocaleDateString()}</strong>.</p>
              <p>Thank you for using our platform!</p>
            </div>
            `
          );
        }
        
        // Email to renter
        if (renterUser?.email) {
          await sendEmail(
            renterUser.email,
            'Product Pickup Completed - Rental Started',
            `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #7c3aed;">Pickup Completed Successfully!</h2>
              <p>Dear ${renterUser.firstName || renterUser.username},</p>
              <p>The pickup for <strong>${productData?.title}</strong> has been completed successfully!</p>
              
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #374151; margin-top: 0;">Rental Details:</h3>
                <p><strong>Product:</strong> ${productData?.title}</p>
                <p><strong>Rental Period:</strong> ${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()}</p>
                <p><strong>Return Deadline:</strong> ${new Date(booking.endDate).toLocaleDateString()}</p>
              </div>
              
              <p><strong>Important:</strong> Please ensure to return the product on time to avoid late fees. You'll receive return instructions closer to the end date.</p>
              <p>Enjoy your rental!</p>
            </div>
            `
          );
        }
      } catch (emailError) {
        console.error('Error sending pickup completion emails:', emailError);
      }
      
      return res.json({ 
        success: true, 
        message: "Pickup verified by both parties and completed. Payment processed to owner.",
        booking,
        paymentStatus: booking.payoutStatus
      });
    } else {
      // Only one party has verified - notify the other party
      const bookingWithDetails = await Booking.findById(bookingId)
        .populate('productId', 'title')
        .populate('renterId', 'firstName lastName username clerkId')
        .populate('ownerId', 'firstName lastName username clerkId');

      if (userType === 'owner' && !otpRecord.renterVerified) {
        // Owner verified, notify renter
        await NotificationService.createPickupVerificationNotification({
          targetUserId: bookingWithDetails.renterId._id,
          targetUserClerkId: bookingWithDetails.renterId.clerkId,
          verifiedBy: bookingWithDetails.ownerId.firstName || 'Owner',
          productTitle: bookingWithDetails.productId.title,
          bookingId: booking._id,
          waitingFor: 'renter'
        });
      } else if (userType === 'renter' && !otpRecord.ownerVerified) {
        // Renter verified, notify owner
        await NotificationService.createPickupVerificationNotification({
          targetUserId: bookingWithDetails.ownerId._id,
          targetUserClerkId: bookingWithDetails.ownerId.clerkId,
          verifiedBy: bookingWithDetails.renterId.firstName || 'Renter',
          productTitle: bookingWithDetails.productId.title,
          bookingId: booking._id,
          waitingFor: 'owner'
        });
      }
    }
    
    res.json({ 
      success: true, 
      message: `OTP verified by ${userType}`,
      ownerVerified: otpRecord.ownerVerified,
      renterVerified: otpRecord.renterVerified
    });
  } catch (error) {
    console.error('Error verifying delivery OTP:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to verify delivery OTP", 
      error: error.message 
    });
  }
};

// Generate OTP for return verification
export const generateReturnOTP = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { userType } = req.body; // 'owner' or 'renter'
    
    const booking = await Booking.findById(bookingId)
      .populate('productId', 'title')
      .populate('renterId', 'email firstName lastName username')
      .populate('ownerId', 'email firstName lastName username');
    
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    
    if (booking.status !== "in_rental") {
      return res.status(400).json({ 
        success: false, 
        message: "Booking must be in rental state for return verification" 
      });
    }
    
    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP valid for 10 minutes
    
    // Check if an active OTP already exists
    const existingOTP = await OTP.findOne({
      bookingId: booking._id,
      type: "return",
      expiresAt: { $gt: new Date() }
    });
    
    if (existingOTP) {
      // Update existing OTP
      existingOTP.otp = otp;
      existingOTP.expiresAt = expiresAt;
      existingOTP.ownerVerified = false;
      existingOTP.renterVerified = false;
      await existingOTP.save();
    } else {
      // Create new OTP record
      await OTP.create({
        bookingId: booking._id,
        otp,
        type: "return",
        expiresAt
      });
    }
    
    // Determine recipient based on userType
    const recipient = userType === 'owner' ? booking.ownerId : booking.renterId;
    const recipientName = recipient.firstName || recipient.username;
    
    // Send OTP via email
    await sendDeliveryReturnOTP(
      recipient.email,
      otp,
      recipientName,
      booking.productId.title,
      false // isDelivery = false (return)
    );

    // Create notification for return request
    if (userType === 'renter') {
      // Renter is requesting return - notify owner
      await NotificationService.createReturnRequestNotification({
        ownerId: booking.ownerClerkId,
        renterId: booking.renterClerkId,
        productTitle: booking.productId.title,
        bookingId: booking._id,
        requestedBy: 'renter',
        dropLocation: booking.dropLocation || 'As specified'
      });
    } else {
      // Owner is initiating return process - notify renter
      await NotificationService.createReturnInitiationNotification({
        renterId: booking.renterClerkId,
        ownerId: booking.ownerClerkId,
        productTitle: booking.productId.title,
        bookingId: booking._id,
        dropLocation: booking.dropLocation || 'As specified'
      });
    }
    
    res.json({ 
      success: true, 
      message: `Return verification OTP sent to ${userType}`,
      expiresAt
    });
  } catch (error) {
    console.error('Error generating return OTP:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to generate return OTP", 
      error: error.message 
    });
  }
};

// Verify return OTP and complete booking
export const verifyReturnOTP = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { otp, userType, dropLocation } = req.body; // 'owner' or 'renter'
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    
    // Find active OTP for this booking
    const otpRecord = await OTP.findOne({
      bookingId: booking._id,
      type: "return",
      otp,
      expiresAt: { $gt: new Date() }
    });
    
    if (!otpRecord) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid or expired OTP" 
      });
    }
    
    // Update verification status based on user type
    if (userType === 'owner') {
      otpRecord.ownerVerified = true;
    } else if (userType === 'renter') {
      otpRecord.renterVerified = true;
    } else {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid user type" 
      });
    }
    
    await otpRecord.save();
    
    // Check if both owner and renter have verified
    if (otpRecord.ownerVerified && otpRecord.renterVerified) {
      // Calculate if return is late
      const currentDate = new Date();
      const endDate = new Date(booking.endDate);
      const isLate = currentDate > endDate;
      
      // Calculate late fee if applicable
      let lateFee = 0;
      if (isLate) {
        const daysLate = Math.ceil((currentDate - endDate) / (1000 * 60 * 60 * 24));
        lateFee = daysLate * (booking.totalPrice * 0.1); // 10% of daily rate per day late
        booking.lateFee = lateFee;
      }
      
      // Complete the booking
      booking.status = "completed";
      booking.returnStatus = isLate ? "late" : "completed";
      booking.returnDate = new Date();
      if (dropLocation) booking.dropLocation = dropLocation;
      await booking.save();
      
      // Process late fee if applicable
      if (lateFee > 0) {
        try {
          // Here you would charge the late fee to the renter's payment method
          // For now, we'll just record it
          console.log(`Late fee of ₹${lateFee} recorded for booking ${booking._id}`);
        } catch (lateFeeError) {
          console.error('Error processing late fee:', lateFeeError);
        }
      }
      
      // Create return completion notifications using NotificationService
      await NotificationService.createReturnCompletionNotification({
        ownerId: booking.ownerClerkId,
        renterId: booking.renterClerkId,
        productTitle: booking.productId.title,
        bookingId: booking._id,
        returnDate: booking.returnDate
      });
      
      // Send email notifications
      try {
        const ownerUser = await User.findById(booking.ownerId);
        const renterUser = await User.findById(booking.renterId);
        const productData = await mongoose.model('Product').findById(booking.productId);
        
        // Email to owner
        if (ownerUser?.email) {
          await sendEmail(
            ownerUser.email,
            'Product Return Completed - Rental Agreement Finished',
            `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #10b981;">Return Completed Successfully!</h2>
              <p>Dear ${ownerUser.firstName || ownerUser.username},</p>
              <p>Great news! Your product <strong>${productData?.title}</strong> has been returned by the renter and the rental agreement is now complete.</p>
              
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #374151; margin-top: 0;">Rental Summary:</h3>
                <p><strong>Product:</strong> ${productData?.title}</p>
                <p><strong>Rental Period:</strong> ${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()}</p>
                <p><strong>Return Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Status:</strong> ${isLate ? '🔶 Returned Late' : '✅ Returned On Time'}</p>
                ${lateFee > 0 ? `<p><strong>Late Fee Collected:</strong> ₹${lateFee.toFixed(2)}</p>` : ''}
              </div>
              
              <p>Thank you for using our platform. We hope you had a great rental experience!</p>
            </div>
            `
          );
        }
        
        // Email to renter
        if (renterUser?.email) {
          await sendEmail(
            renterUser.email,
            'Product Return Completed - Thank You!',
            `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #10b981;">Return Completed Successfully!</h2>
              <p>Dear ${renterUser.firstName || renterUser.username},</p>
              <p>Thank you for returning <strong>${productData?.title}</strong>! Your rental agreement has been completed successfully.</p>
              
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #374151; margin-top: 0;">Rental Summary:</h3>
                <p><strong>Product:</strong> ${productData?.title}</p>
                <p><strong>Rental Period:</strong> ${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()}</p>
                <p><strong>Return Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Status:</strong> ${isLate ? '🔶 Returned Late' : '✅ Returned On Time'}</p>
                ${lateFee > 0 ? `<p><strong>Late Fee Applied:</strong> ₹${lateFee.toFixed(2)}</p>` : ''}
              </div>
              
              ${isLate ? '<p><strong>Note:</strong> A late fee has been applied to your account for returning the product after the deadline.</p>' : '<p>Thank you for returning the product on time!</p>'}
              <p>We hope you enjoyed your rental experience. Feel free to rent again anytime!</p>
            </div>
            `
          );
        }
      } catch (emailError) {
        console.error('Error sending return completion emails:', emailError);
      }
      
      return res.json({ 
        success: true, 
        message: "Return verified by both parties and rental agreement completed",
        booking,
        lateFee: lateFee,
        isLate: isLate
      });
    }
    
    // Send notification for single-party verification
    if (!otpRecord.ownerVerified || !otpRecord.renterVerified) {
      await NotificationService.createReturnVerificationNotification({
        ownerId: booking.ownerClerkId,
        renterId: booking.renterClerkId,
        productTitle: booking.productId.title,
        bookingId: booking._id,
        verifiedBy: userType,
        waitingFor: userType === 'owner' ? 'renter' : 'owner'
      });
    }
    
    res.json({ 
      success: true, 
      message: `OTP verified by ${userType}`,
      ownerVerified: otpRecord.ownerVerified,
      renterVerified: otpRecord.renterVerified
    });
  } catch (error) {
    console.error('Error verifying return OTP:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to verify return OTP", 
      error: error.message 
    });
  }
};

// Complete booking on return (legacy method, kept for backward compatibility)
export const completeBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { dropLocation } = req.body;
    
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    booking.status = "completed";
    booking.returnStatus = "completed";
    booking.returnDate = new Date();
    if (dropLocation) booking.dropLocation = dropLocation;
    await booking.save();

    // Generate return document
    try {
      const documentService = await import('../services/document.service.js');
      const returnDocument = await documentService.createReturnDocument(booking._id);
      console.log('Return document generated:', returnDocument?._id);
    } catch (documentError) {
      console.error('Failed to generate return document:', documentError);
      // Continue even if document generation fails
    }

    // Create notification for owner
    await Notification.create({
      userId: booking.ownerId,
      userClerkId: booking.ownerClerkId,
      type: "drop_scheduled",
      message: `Rental completed and item returned`,
      relatedId: booking._id,
      relatedType: "booking"
    });

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to complete booking", error: error.message });
  }
};

// Cancel booking & refund
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    
    const booking = await Booking.findById(bookingId).populate("paymentId");
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    booking.status = "cancelled";
    booking.cancelReason = reason || "";
    await booking.save();

    if (booking.paymentStatus === "paid") {
      try {
        const refund = await refundStripePayment(booking.paymentId.gatewayPaymentId, booking.totalPrice);
        
        booking.paymentStatus = "refunded";
        booking.refundStatus = "processed";
        booking.refundDate = new Date();
        booking.refundAmount = booking.totalPrice;
        await booking.save();
        
        return res.json({ success: true, message: "Booking cancelled & refunded", refund });
      } catch (refundError) {
        return res.status(500).json({ 
          success: false, 
          message: "Booking cancelled but refund failed", 
          error: refundError.message 
        });
      }
    }

    res.json({ success: true, message: "Booking cancelled" });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ success: false, message: "Failed to cancel booking", error: error.message });
  }
};

// Deadline monitoring and warning system
export const checkAndProcessOverdueRentals = async () => {
  try {
    console.log('Running overdue rental check...');
    const currentTime = new Date();
    
    // Find all active rentals
    const activeRentals = await Booking.find({
      status: 'in_rental',
      returnStatus: { $in: ['pending', 'scheduled'] }
    }).populate('renterId', 'email firstName lastName username')
      .populate('ownerId', 'email firstName lastName username')
      .populate('productId', 'title');

    for (const booking of activeRentals) {
      const endDate = new Date(booking.endDate);
      const timeDiff = currentTime - endDate;
      const hoursOverdue = timeDiff / (1000 * 60 * 60);
      
      // Send reminder 6 hours before deadline
      const sixHoursBefore = new Date(endDate.getTime() - (6 * 60 * 60 * 1000));
      if (currentTime >= sixHoursBefore && currentTime <= endDate && !booking.reminderSent) {
        await sendReturnReminder(booking);
        booking.reminderSent = true;
        await booking.save();
      }
      
      // Send deadline notification at exact deadline
      if (currentTime >= endDate && hoursOverdue <= 0.5 && !booking.deadlineSent) {
        await sendDeadlineNotification(booking);
        booking.deadlineSent = true;
        await booking.save();
      }
      
      // Send warning and apply charges 30 minutes after deadline
      if (hoursOverdue >= 0.5 && !booking.warningSent) {
        await sendOverdueWarning(booking);
        booking.warningSent = true;
        booking.returnStatus = 'late';
        await booking.save();
      }
      
      // Apply escalating late fees for every 24 hours overdue
      if (hoursOverdue >= 24) {
        const daysLate = Math.floor(hoursOverdue / 24);
        const dailyLateRate = booking.totalPrice * 0.1; // 10% of total per day
        const totalLateFee = daysLate * dailyLateRate;
        
        if (totalLateFee > booking.lateFee) {
          booking.lateFee = totalLateFee;
          await booking.save();
          
          // Send escalated warning
          await sendEscalatedWarning(booking, daysLate, totalLateFee);
        }
      }
    }
    
    console.log(`Processed ${activeRentals.length} active rentals`);
  } catch (error) {
    console.error('Error in overdue rental check:', error);
  }
};

// Send return reminder (6 hours before deadline)
const sendReturnReminder = async (booking) => {
  try {
    // Create notification
    await Notification.create({
      userId: booking.renterId,
      userClerkId: booking.renterClerkId,
      type: "return_reminder",
      message: `Reminder: Please return ${booking.productId.title} by ${new Date(booking.endDate).toLocaleString()}`,
      relatedId: booking._id,
      relatedType: "booking"
    });
    
    // Send email
    if (booking.renterId.email) {
      await sendEmail(
        booking.renterId.email,
        'Return Reminder - Product Return Due Soon',
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">Return Reminder</h2>
          <p>Dear ${booking.renterId.firstName || booking.renterId.username},</p>
          <p>This is a friendly reminder that your rental period for <strong>${booking.productId.title}</strong> ends in approximately 6 hours.</p>
          
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="color: #92400e; margin-top: 0;">⏰ Return Details:</h3>
            <p><strong>Return Deadline:</strong> ${new Date(booking.endDate).toLocaleString()}</p>
            <p><strong>Product:</strong> ${booking.productId.title}</p>
            <p><strong>Return Location:</strong> ${booking.dropLocation || 'To be arranged with owner'}</p>
          </div>
          
          <p><strong>Important:</strong> Please arrange for the return of the product before the deadline to avoid late fees.</p>
          <p>Contact the product owner if you need assistance with the return process.</p>
        </div>
        `
      );
    }
    
    console.log(`Return reminder sent for booking ${booking._id}`);
  } catch (error) {
    console.error('Error sending return reminder:', error);
  }
};

// Send deadline notification (at exact deadline)
const sendDeadlineNotification = async (booking) => {
  try {
    // Notify both renter and owner
    await Promise.all([
      // Notify renter
      Notification.create({
        userId: booking.renterId,
        userClerkId: booking.renterClerkId,
        type: "return_deadline",
        message: `⚠️ URGENT: Return deadline reached for ${booking.productId.title}. Please return immediately to avoid late fees.`,
        relatedId: booking._id,
        relatedType: "booking"
      }),
      // Notify owner
      Notification.create({
        userId: booking.ownerId,
        userClerkId: booking.ownerClerkId,
        type: "return_deadline",
        message: `Return deadline reached for ${booking.productId.title}. Contact renter if needed.`,
        relatedId: booking._id,
        relatedType: "booking"
      })
    ]);
    
    // Send urgent email to renter
    if (booking.renterId.email) {
      await sendEmail(
        booking.renterId.email,
        '🚨 URGENT: Return Deadline Reached',
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">🚨 Return Deadline Reached</h2>
          <p>Dear ${booking.renterId.firstName || booking.renterId.username},</p>
          <p>The return deadline for <strong>${booking.productId.title}</strong> has been reached.</p>
          
          <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="color: #991b1b; margin-top: 0;">⚠️ Action Required:</h3>
            <p><strong>Return the product IMMEDIATELY to avoid late fees</strong></p>
            <p><strong>Deadline:</strong> ${new Date(booking.endDate).toLocaleString()}</p>
            <p><strong>Product:</strong> ${booking.productId.title}</p>
          </div>
          
          <p><strong>WARNING:</strong> Late fees will start accumulating after 30 minutes from the deadline.</p>
          <p>Please contact the owner immediately to arrange return.</p>
        </div>
        `
      );
    }
    
    console.log(`Deadline notification sent for booking ${booking._id}`);
  } catch (error) {
    console.error('Error sending deadline notification:', error);
  }
};

// Send overdue warning (30 minutes after deadline)
const sendOverdueWarning = async (booking) => {
  try {
    const initialLateFee = booking.totalPrice * 0.05; // 5% initial late fee
    
    // Update booking with initial late fee
    booking.lateFee = initialLateFee;
    await booking.save();
    
    // Notify both parties
    await Promise.all([
      // Notify renter
      Notification.create({
        userId: booking.renterId,
        userClerkId: booking.renterClerkId,
        type: "overdue_warning",
        message: `🔴 OVERDUE: ${booking.productId.title} return is late. Late fee of ₹${initialLateFee.toFixed(2)} applied. Additional charges will accumulate daily.`,
        relatedId: booking._id,
        relatedType: "booking"
      }),
      // Notify owner
      Notification.create({
        userId: booking.ownerId,
        userClerkId: booking.ownerClerkId,
        type: "overdue_warning",
        message: `Product ${booking.productId.title} is overdue. Late fee of ₹${initialLateFee.toFixed(2)} applied to renter.`,
        relatedId: booking._id,
        relatedType: "booking"
      })
    ]);
    
    // Send overdue email to renter
    if (booking.renterId.email) {
      await sendEmail(
        booking.renterId.email,
        '🔴 OVERDUE: Late Fee Applied - Return Required',
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">🔴 Product Return is OVERDUE</h2>
          <p>Dear ${booking.renterId.firstName || booking.renterId.username},</p>
          <p>Your rental for <strong>${booking.productId.title}</strong> is now overdue.</p>
          
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #dc2626;">
            <h3 style="color: #991b1b; margin-top: 0;">💰 Late Fee Applied:</h3>
            <p><strong>Initial Late Fee:</strong> ₹${initialLateFee.toFixed(2)}</p>
            <p><strong>Daily Late Fee:</strong> ₹${(booking.totalPrice * 0.1).toFixed(2)} per day</p>
            <p><strong>Was Due:</strong> ${new Date(booking.endDate).toLocaleString()}</p>
          </div>
          
          <div style="background-color: #fbbf24; color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold;">⚠️ WARNING: Additional charges of ₹${(booking.totalPrice * 0.1).toFixed(2)} will be added for each day the product remains unreturned.</p>
          </div>
          
          <p><strong>URGENT ACTION REQUIRED:</strong> Return the product immediately to prevent further charges.</p>
        </div>
        `
      );
    }
    
    console.log(`Overdue warning sent for booking ${booking._id}, late fee: ₹${initialLateFee}`);
  } catch (error) {
    console.error('Error sending overdue warning:', error);
  }
};

// Send escalated warning for multi-day delays
const sendEscalatedWarning = async (booking, daysLate, totalLateFee) => {
  try {
    // Notify renter about escalated charges
    await Notification.create({
      userId: booking.renterId,
      userClerkId: booking.renterClerkId,
      type: "escalated_overdue",
      message: `🚨 CRITICAL: ${booking.productId.title} is ${daysLate} days overdue. Total late fees: ₹${totalLateFee.toFixed(2)}. Return immediately!`,
      relatedId: booking._id,
      relatedType: "booking"
    });
    
    // Send escalated email
    if (booking.renterId.email) {
      await sendEmail(
        booking.renterId.email,
        `🚨 CRITICAL: ${daysLate} Days Overdue - Escalated Charges`,
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7f1d1d;">🚨 CRITICAL OVERDUE SITUATION</h2>
          <p>Dear ${booking.renterId.firstName || booking.renterId.username},</p>
          <p>Your rental for <strong>${booking.productId.title}</strong> is now <strong>${daysLate} days overdue</strong>.</p>
          
          <div style="background-color: #7f1d1d; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: white; margin-top: 0;">💰 ACCUMULATED CHARGES:</h3>
            <p><strong>Days Overdue:</strong> ${daysLate} days</p>
            <p><strong>Total Late Fees:</strong> ₹${totalLateFee.toFixed(2)}</p>
            <p><strong>Daily Rate:</strong> ₹${(booking.totalPrice * 0.1).toFixed(2)} per day</p>
          </div>
          
          <div style="background-color: #fbbf24; color: #92400e; padding: 15px; border-radius: 8px; margin: 20px 0; font-weight: bold;">
            <p style="margin: 0;">⚠️ Charges continue to accumulate daily until the product is returned!</p>
          </div>
          
          <p><strong>IMMEDIATE ACTION REQUIRED:</strong> Return the product NOW to stop additional charges.</p>
          <p>Contact our support team if you need assistance: support@rentalplatform.com</p>
        </div>
        `
      );
    }
    
    console.log(`Escalated warning sent for booking ${booking._id}, days late: ${daysLate}, total fee: ₹${totalLateFee}`);
  } catch (error) {
    console.error('Error sending escalated warning:', error);
  }
};

// Initialize cron job for deadline monitoring (runs every 30 minutes)
const initializeDeadlineMonitoring = () => {
  // Run every 30 minutes
  cron.schedule('*/30 * * * *', () => {
    console.log('Running scheduled overdue rental check...');
    checkAndProcessOverdueRentals();
  });
  
  console.log('Deadline monitoring cron job initialized - running every 30 minutes');
};

// Export the initialization function
export { initializeDeadlineMonitoring };

// Update booking payment status (simple payment completion)
export const updateBookingPaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { paymentStatus, paymentMethod, paymentData } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('productId', 'title')
      .populate('renterId', 'username email firstName lastName')
      .populate('ownerId', 'username email firstName lastName');
      
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== "pending_payment") {
      return res.status(400).json({ success: false, message: "Booking is not ready for payment" });
    }

    // Update booking status
    booking.status = "paid";
    booking.paymentStatus = paymentStatus;
    await booking.save();
    
    // Generate pickup document
    try {
      const documentService = await import('../services/document.service.js');
      const pickupDocument = await documentService.createPickupDocument(booking._id);
      console.log('Pickup document generated:', pickupDocument?._id);
    } catch (documentError) {
      console.error('Failed to generate pickup document:', documentError);
      // Continue even if document generation fails
    }

    // Create payment record
    const payment = await Payment.create({
      bookingId,
      renterId: booking.renterId._id,
      renterClerkId: booking.renterClerkId,
      amount: booking.totalPrice,
      platformFee: booking.platformFee,
      ownerAmount: booking.ownerAmount,
      method: paymentMethod || 'card',
      status: 'completed',
      transactionId: paymentData?.transactionId || `TXN_${Date.now()}`,
      metadata: paymentData || {}
    });

    // Create invoice for the payment
    let invoice = null;
    try {
      invoice = await createInvoiceForBooking(booking._id);
    } catch (invoiceError) {
      console.error('Failed to create invoice:', invoiceError);
    }

    // Notify owner that payment is received (in-site notification)
    try {
      await NotificationService.createPaymentConfirmationPickupNotification({
        ownerId: booking.ownerId._id,
        ownerClerkId: booking.ownerClerkId,
        renterName: `${booking.renterId?.firstName || ''} ${booking.renterId?.lastName || ''}`.trim() || 'Customer',
        productTitle: booking.productId?.title || booking.productId?.name || 'Product',
        amount: booking.totalPrice,
        startDate: booking.startDate,
        endDate: booking.endDate,
        bookingId: booking._id
      });
      console.log('Payment confirmation pickup notification sent to owner');
    } catch (notificationError) {
      console.error('Failed to create payment notification:', notificationError);
    }

    // Send email notification to owner
    try {
      const ownerEmail = booking.ownerId?.email;
      const renterName = `${booking.renterId?.firstName || ''} ${booking.renterId?.lastName || ''}`.trim() || 'Customer';
      const productName = booking.productId?.title || booking.productId?.name || 'Product';
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
                    <p style="margin: 5px 0;"><strong>Amount Paid:</strong> ₹${booking.totalPrice}</p>
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
                  <a href="http://localhost:5173/notifications" 
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

    // Send email notifications
    try {
      // Email to renter
      await sendEmail({
        to: booking.renterId.email,
        subject: `Payment Confirmation - ${booking.productId?.title}`,
        html: `
          <h2>Payment Confirmed!</h2>
          <p>Your payment for <strong>${booking.productId?.title}</strong> has been processed successfully.</p>
          <p><strong>Amount Paid:</strong> ₹${booking.totalPrice.toFixed(2)}</p>
          <p><strong>Booking ID:</strong> ${booking._id}</p>
          <p>The owner has been notified and will contact you soon with pickup/delivery details.</p>
        `
      });

      // Email to owner
      await sendEmail({
        to: booking.ownerId.email,
        subject: `Payment Received - ${booking.productId?.title}`,
        html: `
          <h2>Payment Received!</h2>
          <p>Payment for your product <strong>${booking.productId?.title}</strong> has been received.</p>
          <p><strong>Amount:</strong> ₹${booking.ownerAmount.toFixed(2)} (after platform fee)</p>
          <p><strong>Renter:</strong> ${booking.renterId.firstName} ${booking.renterId.lastName}</p>
          <p><strong>Rental Period:</strong> ${booking.startDate.toDateString()} to ${booking.endDate.toDateString()}</p>
          <p>Please prepare the item and contact the renter for pickup/delivery arrangements.</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send emails:', emailError);
    }

    res.json({ 
      success: true, 
      message: "Payment completed successfully", 
      booking,
      payment,
      invoiceId: invoice?._id
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to update payment status", 
      error: error.message 
    });
  }
};
