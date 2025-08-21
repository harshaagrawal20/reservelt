import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    renterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    renterClerkId: { type: String, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ownerClerkId: { type: String, required: true },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    totalPrice: { type: Number, required: true },
    securityDeposit: { type: Number, default: 0 },

    status: { 
      type: String, 
      enum: ["requested", "accepted", "rejected", "pending_payment", "confirmed", "in_rental", "cancelled", "completed"], 
      default: "requested" 
    },
    paymentStatus: { type: String, enum: ["unpaid", "pending", "paid", "refunded", "failed"], default: "unpaid" },

    // Stripe payment fields
    stripePaymentIntentId: { type: String },
    stripeSessionId: { type: String },
    stripeCustomerId: { type: String },
    
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },

    pickupStatus: { type: String, enum: ["pending", "scheduled", "completed"], default: "pending" },
    pickupDate: Date,

    deliveryStatus: { type: String, enum: ["pending", "out_for_delivery", "delivered"], default: "pending" },
    deliveryDate: Date,
    deliveryOTP: { type: String },
    deliveryOTPExpiry: { type: Date },

    returnStatus: { type: String, enum: ["pending", "scheduled", "completed", "late"], default: "pending" },
    returnDate: Date,
    returnOTP: { type: String },
    returnOTPExpiry: { type: Date },
    lateFee: { type: Number, default: 0 },

    platformFee: { type: Number, default: 0 },
    ownerAmount: { type: Number, default: 0 },

    payoutStatus: { type: String, enum: ["pending", "processing", "completed", "failed"], default: "pending" },
    payoutDate: Date,

    cancelReason: { type: String },
    notes: { type: String },

    // Email reminder flags
    reminderSent: { type: Boolean, default: false }, // 6 hours before endDate
    deadlineSent: { type: Boolean, default: false }, // at endDate
    warningSent: { type: Boolean, default: false }   // 30 minutes after endDate
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
