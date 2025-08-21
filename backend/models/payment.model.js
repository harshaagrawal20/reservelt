import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },

    renterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    renterClerkId: { type: String, required: true },

    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ownerClerkId: { type: String, required: true },

    paymentGateway: { type: String, enum: ["stripe"], required: true },
    gatewayPaymentId: { type: String, required: true }, // Stripe Payment Intent ID
    gatewayChargeId: { type: String }, // Stripe Charge ID

    amount: { type: Number, required: true },
    currency: { type: String, default: "usd" },

    platformFee: { type: Number, required: true },
    ownerAmount: { type: Number, required: true },

    paymentStatus: { type: String, enum: ["initiated", "successful", "failed", "refunded"], default: "initiated" },
    paymentDate: { type: Date },

    payoutStatus: { type: String, enum: ["pending", "processing", "completed", "failed"], default: "pending" },
    payoutDate: { type: Date },
    payoutTransactionId: { type: String }, // Stripe Transfer ID

    refundStatus: { type: String, enum: ["none", "requested", "processed"], default: "none" },
    refundDate: { type: Date },
    refundAmount: { type: Number },

    notes: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
