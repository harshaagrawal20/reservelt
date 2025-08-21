import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const confirmPayment = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    return {
      success: true,
      status: paymentIntent.status,
      paymentIntent,
    };
  } catch (error) {
    console.error('Error confirming payment:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const createCheckoutSession = async (bookingData) => {
  try {
    const {
      productName,
      productDescription,
      amount,
      currency = 'usd',
      bookingId,
      successUrl,
      cancelUrl,
      customerEmail,
    } = bookingData;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: productName,
              description: productDescription,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      metadata: {
        bookingId: bookingId.toString(),
      },
    });

    return {
      success: true,
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const retrieveCheckoutSession = async (sessionId) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    return {
      success: true,
      session,
    };
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const handleWebhook = async (payload, signature) => {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    return {
      success: true,
      event,
    };
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
