import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reviewerClerkId: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String
  },
  { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);
