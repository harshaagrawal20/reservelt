// Script to create an admin user for testing
import User from './models/user.js'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL)
    console.log('Connected to MongoDB')

    // Create or update an admin user
    const adminEmail = 'admin@rental.com'
    const adminClerkId = 'admin_test_id' // You'll replace this with actual Clerk ID

    const adminUser = await User.findOneAndUpdate(
      { email: adminEmail },
      {
        clerkId: adminClerkId,
        email: adminEmail,
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        photo: ''
      },
      { 
        upsert: true, 
        new: true 
      }
    )

    console.log('Admin user created/updated:', {
      id: adminUser._id,
      email: adminUser.email,
      username: adminUser.username,
      role: adminUser.role
    })

    console.log('\n🔑 Admin Login Instructions:')
    console.log('1. Go to /admin-login page')
    console.log('2. Sign in with the admin account credentials')
    console.log('3. You will be redirected to /admin if successful')
    console.log('4. Regular users will be denied access with proper error message')

  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

createAdminUser()
