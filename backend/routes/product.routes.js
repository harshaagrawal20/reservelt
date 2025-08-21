import express from "express";
import multer from 'multer'
import path from 'path'
import {
  createProduct,
  getAllProducts,
  getMyProducts,
  getBrowseProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  approveProduct,
  rejectProduct,
  checkProductAvailability,
  getProductBookingStatus
} from "../controllers/product.controller.js";
import { uploadBuffer } from '../services/cloudinary.service.js'

const router = express.Router();

// Multer memory storage for Cloudinary
const upload = multer({ storage: multer.memoryStorage() })

// Public
router.get("/", getAllProducts);
router.get("/my/:clerkId", getMyProducts);
router.get("/browse/:clerkId", getBrowseProducts);
router.get("/availability/:productId", checkProductAvailability);
router.get("/booking-status/:productId", getProductBookingStatus);
router.get("/:id", getProductById);

// Upload images to Cloudinary
router.post('/upload', upload.array('images', 8), async (req, res) => {
  try {
    const files = req.files || []
    if (!files.length) {
      return res.json({ success: true, files: [] })
    }

    // Check if Cloudinary is configured
    const hasCloudinaryCredentials = !!(
      process.env.CLOUDINARY_CLOUD_NAME && 
      process.env.CLOUDINARY_API_KEY && 
      process.env.CLOUDINARY_API_SECRET
    )

    if (!hasCloudinaryCredentials) {
      console.warn('Cloudinary not configured, falling back to placeholder URLs')
      
      // Return local placeholder URLs since Cloudinary is not configured
      const urls = files.map((file, idx) => `/uploads/placeholder.svg`)
      return res.json({ 
        success: true, 
        files: urls,
        message: 'Using local placeholder images - Cloudinary not configured'
      })
    }

    // Upload to Cloudinary
    const uploads = await Promise.all(
      files.map((file, idx) => uploadBuffer(file.buffer, 'rental-products', `product-${Date.now()}-${idx}`))
    )
    const urls = uploads.map(u => u.secure_url || u.url)
    res.json({ success: true, files: urls })
  } catch (error) {
    console.error('Upload failed:', error)
    
    // Fallback to local placeholder URLs if upload fails
    const files = req.files || []
    const fallbackUrls = files.map((file, idx) => `/uploads/placeholder.svg`)
    
    res.status(200).json({ 
      success: true, 
      files: fallbackUrls,
      message: 'Upload failed, using local placeholder images',
      error: error.message 
    })
  }
})

// Authenticated user
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

// Admin only
router.put("/:id/approve", approveProduct);
router.put("/:id/reject", rejectProduct);

export default router;
