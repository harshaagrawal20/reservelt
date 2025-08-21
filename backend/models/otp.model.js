import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: { type: String },
    otpHash: { type: String },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    otp: { type: String },
    type: { type: String, enum: ["admin", "delivery", "return"] },
    ownerVerified: { type: Boolean, default: false },
    renterVerified: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);

// Add index for expiration and automatic cleanup
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("OTP", otpSchema);