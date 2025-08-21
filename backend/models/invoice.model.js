import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  invoiceNumber: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "usd" },
  status: { type: String, enum: ["unpaid", "paid", "partial", "cancelled"], default: "unpaid" },
  dueDate: { type: Date },
  paidDate: { type: Date },
  items: [
    {
      description: String,
      quantity: Number,
      unitPrice: Number,
      total: Number
    }
  ],
  deposit: { type: Number, default: 0 },
  lateFee: { type: Number, default: 0 },
  notes: { type: String },
  pdfUrl: { type: String },
}, { timestamps: true });

export default mongoose.model("Invoice", invoiceSchema);