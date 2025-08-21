import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  type: {
    type: String,
    enum: ['pickup', 'return'],
    required: true
  },
  documentNumber: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  completedDate: {
    type: Date
  },
  notes: {
    type: String
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 1
    },
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good'
    },
    notes: String
  }],
  signature: {
    type: String
  },
  pdfUrl: {
    type: String
  }
}, { timestamps: true });

export default mongoose.model('Document', documentSchema);