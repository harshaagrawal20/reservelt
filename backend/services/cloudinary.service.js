import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'
dotenv.config()

// Check if all required Cloudinary credentials are available
const hasCloudinaryCredentials = !!(
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET
)

// Configure Cloudinary only if credentials are available
if (hasCloudinaryCredentials) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  })
  console.log('✅ Cloudinary configured successfully')
} else {
  console.warn('⚠️ Cloudinary credentials not found. Image upload will use fallback method.')
}

export function uploadBuffer(buffer, folder = 'rental-products', filename = 'upload') {
  return new Promise((resolve, reject) => {
    // Check if Cloudinary is properly configured
    if (!hasCloudinaryCredentials) {
      return reject(new Error('Cloudinary not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.'))
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: `${filename}-${Date.now()}`,
        resource_type: 'image',
        timeout: 60000 // 60 second timeout
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error)
          return reject(error)
        }
        resolve(result)
      }
    )

    uploadStream.end(buffer)
  })
}

export default cloudinary
