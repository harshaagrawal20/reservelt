import express from 'express'
import {
  createUser,
  getUserById,
  getUserByClerkId,
  updateUser,
  deleteUser,
  getAllUsers,
  handleClerkWebhook,
  checkAdminRole,
  initiateAdminLogin,
  verifyAdminOTP
} from '../controllers/user.controller.js'
import { extractClerkId } from '../middlewares/authMiddleware.js'

const router = express.Router()

// User CRUD routes
router.post('/', createUser)
router.get('/', getAllUsers)
router.get('/id/:userId', getUserById)
router.get('/clerk/:clerkId', getUserByClerkId)
router.put('/clerk/:clerkId', updateUser)
router.delete('/clerk/:clerkId', deleteUser)

// Admin authentication routes
router.post('/admin/login', initiateAdminLogin)
router.post('/admin/verify-otp', verifyAdminOTP)
router.get('/check-admin', extractClerkId, checkAdminRole)

// Clerk webhook route
router.post('/webhooks/clerk', handleClerkWebhook)

export default router
