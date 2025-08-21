import User from '../models/user.js'
import NotificationService from '../services/notification.service.js'

// Helper function to handle errors
const handleError = (res, error, message = 'An error occurred', statusCode = 500) => {
  console.error('Error:', error)
  return res.status(statusCode).json({
    success: false,
    message,
    error: error.message,
  })
}

// Create a new user
export const createUser = async (req, res) => {
  try {
    const { clerkId, email, username, firstName, lastName, photo } = req.body

    if (!clerkId || !email || !username) {
      return res.status(400).json({
        success: false,
        message: 'clerkId, email, and username are required',
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ clerkId }, { email }, { username }]
    })

    if (existingUser) {
      // If user exists with same clerkId, return the existing user instead of error
      if (existingUser.clerkId === clerkId) {
        return res.status(200).json({
          success: true,
          message: 'User already exists',
          user: existingUser,
        })
      }
      
      return res.status(409).json({
        success: false,
        message: 'User with this email or username already exists',
      })
    }

    const newUser = await User.create({
      clerkId,
      email,
      username,
      firstName: firstName || '',
      lastName: lastName || '',
      photo: photo || '',
    })

    // Create welcome notification for new user
    try {
      await NotificationService.createSystemNotification({
        userClerkId: clerkId,
        message: `Welcome to our rental platform, ${firstName || username}! Start by listing your first product or browsing available rentals.`,
        metadata: {
          welcomeBonus: true,
          action: 'user_welcome',
          signupDate: new Date()
        }
      })
    } catch (notificationError) {
      console.error('Failed to create welcome notification:', notificationError)
      // Don't fail user creation if notification fails
    }

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: newUser,
    })
  } catch (error) {
    return handleError(res, error, 'Failed to create user')
  }
}

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId).populate('products').populate('bookings')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    return res.status(200).json({
      success: true,
      user,
    })
  } catch (error) {
    return handleError(res, error, 'Failed to get user')
  }
}

// Get user by Clerk ID
export const getUserByClerkId = async (req, res) => {
  try {
    const { clerkId } = req.params

    if (!clerkId || clerkId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Valid Clerk ID is required',
      })
    }

    const user = await User.findOne({ clerkId }).populate('products').populate('bookings')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    return res.status(200).json({
      success: true,
      user,
    })
  } catch (error) {
    return handleError(res, error, 'Failed to get user')
  }
}

// Update user
export const updateUser = async (req, res) => {
  try {
    const { clerkId } = req.params
    const updateData = req.body

    if (!clerkId || clerkId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Valid Clerk ID is required',
      })
    }

    const updatedUser = await User.findOneAndUpdate(
      { clerkId },
      updateData,
      { new: true, runValidators: true }
    )

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser,
    })
  } catch (error) {
    return handleError(res, error, 'Failed to update user')
  }
}

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { clerkId } = req.params

    // Find user to delete
    const userToDelete = await User.findOne({ clerkId })

    if (!userToDelete) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    // Delete user - clean up related data
    const deletedUser = await User.findByIdAndDelete(userToDelete._id)

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      user: deletedUser,
    })
  } catch (error) {
    return handleError(res, error, 'Failed to delete user')
  }
}

// Get all users (admin function)
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query

    const query = search
      ? {
          $or: [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { username: { $regex: search, $options: 'i' } },
          ],
        }
      : {}

    const users = await User.find(query)
      .select('-__v')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })

    const total = await User.countDocuments(query)

    return res.status(200).json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return handleError(res, error, 'Failed to get users')
  }
}

// Clerk webhook handler
export const handleClerkWebhook = async (req, res) => {
  try {
    const { type, data } = req.body

    switch (type) {
      case 'user.created':
        await createUser({
          body: {
            clerkId: data.id,
            email: data.email_addresses[0]?.email_address,
            username: data.username || data.email_addresses[0]?.email_address?.split('@')[0],
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            photo: data.image_url || '',
          }
        }, res)
        break

      case 'user.updated':
        await updateUser({
          params: { clerkId: data.id },
          body: {
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            username: data.username || data.email_addresses[0]?.email_address?.split('@')[0],
            photo: data.image_url || '',
          }
        }, res)
        break

      case 'user.deleted':
        await deleteUser({
          params: { clerkId: data.id }
        }, res)
        break

      default:
        return res.status(200).json({ success: true, message: 'Webhook received' })
    }
  } catch (error) {
    return handleError(res, error, 'Webhook processing failed')
  }
}

// Check if user has admin role
export const checkAdminRole = async (req, res) => {
  try {
    const { clerkId } = req.user // Assuming clerkId is available from auth middleware

    const user = await User.findOne({ clerkId })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        isAdmin: false
      })
    }

    return res.status(200).json({
      success: true,
      isAdmin: user.role === 'admin',
      role: user.role
    })
  } catch (error) {
    return handleError(res, error, 'Failed to check admin role')
  }
}

// Check if email belongs to admin and send OTP
export const initiateAdminLogin = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      })
    }

    // Check if user exists and is admin
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      })
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Save OTP to database (you'll need to create an OTP model)
    // For now, we'll store it in the user document temporarily
    user.adminOtp = otp
    user.adminOtpExpiry = otpExpiry
    await user.save()

    // Send OTP email (implement your email service)
    try {
      // Import your email service
      const emailService = await import('../services/email.service.js')
      await emailService.sendAdminOTP(email, otp, user.firstName || 'Admin')
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError)
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email'
      })
    }

    return res.status(200).json({
      success: true,
      message: 'OTP sent to your email address',
      email: email
    })
  } catch (error) {
    return handleError(res, error, 'Failed to initiate admin login')
  }
}

// Verify OTP and complete admin login
export const verifyAdminOTP = async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      })
    }

    // Find user and verify OTP
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    if (!user.adminOtp || !user.adminOtpExpiry) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found. Please request a new one.'
      })
    }

    if (user.adminOtpExpiry < new Date()) {
      // Clear expired OTP
      user.adminOtp = undefined
      user.adminOtpExpiry = undefined
      await user.save()

      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      })
    }

    if (user.adminOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      })
    }

    // OTP verified successfully - clear it
    user.adminOtp = undefined
    user.adminOtpExpiry = undefined
    await user.save()

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      user: {
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    })
  } catch (error) {
    return handleError(res, error, 'Failed to verify admin OTP')
  }
}
