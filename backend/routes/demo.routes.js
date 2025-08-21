import express from 'express'
import { createDemoNotifications } from '../controllers/demo.controller.js'

const router = express.Router()

// Create demo notifications for testing
router.post('/notifications', createDemoNotifications)

export default router
