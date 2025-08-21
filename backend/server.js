import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Import routes
import userRoutes from './routes/user.routes.js';
import productRoutes from './routes/product.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import reviewRoutes from './routes/review.routes.js';
import reportRoutes from './routes/report.routes.js';
import pricelistRoutes from './routes/pricelist.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import reminderRoutes from './routes/reminder.routes.js';
import documentRoutes from './routes/document.routes.js';
import testRoutes from './routes/test.routes.js';

// Import cron job service
import rentalReminderCron from './services/rentalReminder.cron.js';
import { initializeDeadlineMonitoring } from './controllers/booking.controller.js';

// Import models to register schemas
import './models/user.js';
import './models/product.model.js';
import './models/booking.model.js';
import './models/payment.model.js';
import './models/notification.model.js';
import './models/otp.model.js';
import './models/review.model.js';
import './models/report.model.js';
import './models/pricelist.model.js';
import './models/invoice.model.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploads folder statically
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory');
}

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log('📁 Created public directory');
}

app.use('/uploads', express.static(uploadsDir));
app.use('/public', express.static(publicDir));

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rental-management');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/pricelists', pricelistRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/test', testRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Test document generation page
app.get('/test-documents', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test-documents.html'));
});

// 404 handler for API routes only
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.message
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
      error: error.message
    });
  }
  
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry',
      error: 'Resource already exists'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
const startServer = async () => {
  await connectDB();
  
  // Initialize cron job for rental reminders
  console.log('🔄 Initializing rental reminder cron job...');
  
  // Initialize deadline monitoring system
  console.log('⏰ Initializing deadline monitoring system...');
  initializeDeadlineMonitoring();
  
  // Test email connection on startup
  try {
    const { testEmailConnection } = await import('./services/emailReminder.service.js');
    await testEmailConnection();
    console.log('✅ Email service connection verified');
  } catch (error) {
    console.warn('⚠️ Email service connection failed:', error.message);
  }
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
    console.log('📧 Rental reminder emails will be sent automatically every 5 minutes');
    console.log('⏰ Deadline monitoring active - checking overdue rentals every 30 minutes');
    console.log('🔗 Test reminder endpoints:');
    console.log(`   POST http://localhost:${PORT}/api/reminders/trigger`);
    console.log(`   GET  http://localhost:${PORT}/api/reminders/stats`);
    console.log(`   POST http://localhost:${PORT}/api/reminders/test-email`);
  });
};

startServer().catch(console.error);
