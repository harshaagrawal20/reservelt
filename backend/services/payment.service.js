import Stripe from 'stripe';

// Initialize Stripe with secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

// Create a payment intent with Stripe
export const createStripePaymentIntent = async (amount, currency, bookingId, metadata) => {
  try {
    // Convert amount to cents (Stripe uses smallest currency unit)
    const amountInCents = Math.round(amount * 100);
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      metadata: {
        bookingId,
        ...metadata
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    return {
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      metadata: paymentIntent.metadata
    };
  } catch (error) {
    console.error('Error creating Stripe payment intent:', error);
    throw error;
  }
};

// Confirm a payment with Stripe
export const confirmStripePayment = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    // If payment intent is already succeeded, just return it
    if (paymentIntent.status === 'succeeded') {
      return paymentIntent;
    }
    
    // Otherwise, confirm the payment (this is usually done client-side)
    // This is a fallback for server-side confirmation
    return await stripe.paymentIntents.confirm(paymentIntentId);
  } catch (error) {
    console.error('Error confirming Stripe payment:', error);
    throw error;
  }
};

// Create a transfer to the owner's account
export const createStripeTransfer = async (amount, destinationAccountId, metadata) => {
  try {
    // Convert amount to cents
    const amountInCents = Math.round(amount * 100);
    
    // Create transfer to connected account
    const transfer = await stripe.transfers.create({
      amount: amountInCents,
      currency: 'inr',
      destination: destinationAccountId,
      metadata
    });
    
    return transfer;
  } catch (error) {
    console.error('Error creating Stripe transfer:', error);
    throw error;
  }
};

// Refund a payment
export const refundStripePayment = async (paymentIntentId, amount) => {
  try {
    // Convert amount to cents
    const amountInCents = amount ? Math.round(amount * 100) : undefined;
    
    // Create refund
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amountInCents, // If undefined, refunds the full amount
    });
    
    return refund;
  } catch (error) {
    console.error('Error refunding Stripe payment:', error);
    throw error;
  }
};
