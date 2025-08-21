import express from "express";
import { getAllPayments, getPaymentById, handleStripeWebhook, initiatePayment, confirmPayment, testPaymentMethods } from "../controllers/payment.controller.js";

const router = express.Router();

// Get all payments (admin)
router.get("/", getAllPayments);

// Test payment methods configuration
router.post("/test-methods", testPaymentMethods);

// Get single payment
router.get("/:paymentId", getPaymentById);

// Initiate payment for a booking
router.post("/initiate/:id", initiatePayment);

// Confirm payment for a booking  
router.post("/confirm/:id", confirmPayment);

// Stripe webhook for payment confirmations
router.post("/webhook/stripe", express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;
