import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    reason: { type: String, required: true },
    status: { type: String, enum: ["open", "resolved"], default: "open" }
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
