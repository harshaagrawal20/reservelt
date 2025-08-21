import express from 'express';
import { handleWebhook } from '../services/stripe.service.js';
import Booking from '../models/booking.model.js';
import Payment from '../models/payment.model.js';

const router = express.Router();

// Stripe webhook endpoint (needs raw body)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const payload = req.body;

    const webhookResult = await handleWebhook(payload, sig);
    
    if (!webhookResult.success) {
      return res.status(400).json({
        success: false,
        error: webhookResult.error
      });
    }

    const event = webhookResult.event;

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Handle successful checkout session
const handleCheckoutSessionCompleted = async (session) => {
  try {
    const bookingId = session.metadata?.bookingId;
    
    if (!bookingId) {
      console.error('No booking ID in session metadata');
      return;
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      console.error('Booking not found:', bookingId);
      return;
    }

    // Update booking if not already processed
    if (booking.paymentStatus !== 'paid') {
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      booking.stripeSessionId = session.id;
      await booking.save();

      console.log(`Booking ${bookingId} updated via webhook`);
    }
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
};

// Handle successful payment intent
const handlePaymentIntentSucceeded = async (paymentIntent) => {
  try {
    const bookingId = paymentIntent.metadata?.bookingId;
    
    if (!bookingId) {
      console.error('No booking ID in payment intent metadata');
      return;
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      console.error('Booking not found:', bookingId);
      return;
    }

    // Update booking if not already processed
    if (booking.paymentStatus !== 'paid') {
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      booking.stripePaymentIntentId = paymentIntent.id;
      await booking.save();

      console.log(`Booking ${bookingId} updated via webhook`);
    }
  } catch (error) {
    console.error('Error handling payment intent succeeded:', error);
  }
};

// Handle failed payment intent
const handlePaymentIntentFailed = async (paymentIntent) => {
  try {
    const bookingId = paymentIntent.metadata?.bookingId;
    
    if (!bookingId) {
      console.error('No booking ID in payment intent metadata');
      return;
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      console.error('Booking not found:', bookingId);
      return;
    }

    // Update booking payment status to failed
    booking.paymentStatus = 'failed';
    await booking.save();

    console.log(`Booking ${bookingId} payment failed via webhook`);
  } catch (error) {
    console.error('Error handling payment intent failed:', error);
  }
};

export default router;
