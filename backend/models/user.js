import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    default: '',
  },
  lastName: {
    type: String,
    default: '',
  },
  photo: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer',
  },
  // Admin OTP fields for secure login
  adminOtp: {
    type: String,
    default: undefined,
  },
  adminOtpExpiry: {
    type: Date,
    default: undefined,
  },
  // Additional fields for rental management - using actual model names
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
  ],
  bookings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
  ],
  // Stripe account for receiving payments as an owner
  stripeAccountId: {
    type: String,
    default: null
  },
  stripeAccountStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
}, {
  timestamps: true,
})

const User = mongoose.model('User', userSchema)

export default User
