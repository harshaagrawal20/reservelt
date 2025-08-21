import mongoose from "mongoose";

const priceRuleSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  category: { type: String },
  customerGroup: { type: String }, // e.g., 'corporate', 'vip', etc.
  minDuration: { type: Number, default: 1 }, // in hours/days
  maxDuration: { type: Number },
  unit: { type: String, enum: ["hour", "day", "week"], required: true },
  price: { type: Number, required: true },
  discountType: { type: String, enum: ["none", "percent", "fixed"], default: "none" },
  discountValue: { type: Number, default: 0 },
  validFrom: { type: Date },
  validTo: { type: Date }
});

const pricelistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  rules: [priceRuleSchema],
  isActive: { type: Boolean, default: true },
  validFrom: { type: Date },
  validTo: { type: Date },
  customerGroup: { type: String }, // e.g., 'corporate', 'vip', etc.
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("Pricelist", pricelistSchema);