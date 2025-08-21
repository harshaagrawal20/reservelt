import Product from "../models/product.model.js";
import User from "../models/user.js";
import NotificationService from "../services/notification.service.js";
import mongoose from "mongoose";

const handleError = (res, error, message = "An error occurred", status = 500) => {
  console.error(error);
  res.status(status).json({ success: false, message, error: error.message });
};

// Create product
export const createProduct = async (req, res) => {
  try {
    const { 
      clerkId, 
      title, 
      description, 
      category, 
      brand,
      tags,
      targetAudience,
      pricePerHour, 
      pricePerDay, 
      pricePerWeek, 
      location, 
      pickupLocation,
      dropLocation,
      images, 
      availability 
    } = req.body;

    // Validate required fields
    if (!clerkId) {
      return res.status(400).json({ success: false, message: "Clerk ID is required" });
    }

    if (!title || !description || !category || !location) {
      return res.status(400).json({ success: false, message: "Title, description, category, and location are required" });
    }

    // Find or create user
    let owner = await User.findOne({ clerkId });
    if (!owner) {
      // Try to create a basic user record if not found
      try {
        owner = await User.create({
          clerkId,
          email: `${clerkId}@temp.com`, // Temporary email
          username: `user_${clerkId.slice(-8)}`, // Temporary username
          firstName: '',
          lastName: ''
        });
        console.log('Created new user for product creation:', owner._id);
      } catch (userError) {
        console.error('Failed to create user:', userError);
        return res.status(404).json({ success: false, message: "Owner not found and could not be created" });
      }
    }

    const product = await Product.create({
      ownerId: owner._id,
      ownerClerkId: clerkId,
      title,
      description,
      category,
      brand: brand || '',
      tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : []),
      targetAudience: targetAudience || 'All Ages',
      pricePerHour: pricePerHour || 0,
      pricePerDay: pricePerDay || 0,
      pricePerWeek: pricePerWeek || 0,
      location,
      pickupLocation: pickupLocation || location,
      dropLocation: dropLocation || location,
      images: images || [],
      availability: availability || [],
      status: 'approved'
    });

    // Create notification for successful product listing
    try {
      await NotificationService.createSystemNotification({
        userClerkId: clerkId,
        message: `Your product "${title}" has been successfully listed and is now available for rent!`,
        metadata: {
          productId: product._id,
          productTitle: title,
          category,
          action: 'product_listed'
        }
      })
    } catch (notificationError) {
      console.error('Failed to create product listing notification:', notificationError)
      // Don't fail the product creation if notification fails
    }

    res.status(201).json({ success: true, message: "Product created", product });
  } catch (error) {
    console.error('Product creation error:', error);
    handleError(res, error, "Failed to create product");
  }
};

// Get products with optional filters
export const getAllProducts = async (req, res) => {
  try {
    const { ownerClerkId, ownerId, status = 'approved', q, category, brand, targetAudience } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (ownerClerkId) filter.ownerClerkId = ownerClerkId;
    if (ownerId) filter.ownerId = ownerId;
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (targetAudience) filter.targetAudience = targetAudience;
    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [{ title: regex }, { description: regex }, { category: regex }, { brand: regex }];
    }
    const products = await Product.find(filter).populate("ownerId", "username email firstName lastName");
    res.status(200).json({ success: true, products });
  } catch (error) {
    handleError(res, error, "Failed to fetch products");
  }
};

// Get user's own products
export const getMyProducts = async (req, res) => {
  try {
    const { clerkId } = req.params;
    const { status = 'approved', q, category, brand, targetAudience } = req.query;
    
    const filter = { ownerClerkId: clerkId };
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (targetAudience) filter.targetAudience = targetAudience;
    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [{ title: regex }, { description: regex }, { category: regex }, { brand: regex }];
    }
    
    const products = await Product.find(filter).populate("ownerId", "username email firstName lastName");
    res.status(200).json({ success: true, products });
  } catch (error) {
    handleError(res, error, "Failed to fetch user products");
  }
};

// Get other users' products (exclude current user's products)
export const getBrowseProducts = async (req, res) => {
  try {
    const { clerkId } = req.params;
    const { status = 'approved', q, category, brand, targetAudience, startDate, endDate } = req.query;
    
    const filter = { 
      ownerClerkId: { $ne: clerkId }, // Exclude current user's products
      status: status
    };
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (targetAudience) filter.targetAudience = targetAudience;
    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [{ title: regex }, { description: regex }, { category: regex }, { brand: regex }];
    }
    
    // Get all products matching the filter
    const products = await Product.find(filter).populate("ownerId", "username email firstName lastName");
    
    // If date range is provided, filter out products that are already booked for those dates
    if (startDate && endDate) {
      const requestedStartDate = new Date(startDate);
      const requestedEndDate = new Date(endDate);
      
      // Get all bookings that overlap with the requested date range
      const Booking = mongoose.model('Booking');
      const overlappingBookings = await Booking.find({
        $and: [
          { status: { $nin: ['rejected', 'cancelled'] } },
          { $or: [
            // Booking starts during requested period
            { startDate: { $gte: requestedStartDate, $lte: requestedEndDate } },
            // Booking ends during requested period
            { endDate: { $gte: requestedStartDate, $lte: requestedEndDate } },
            // Booking spans the entire requested period
            { $and: [{ startDate: { $lte: requestedStartDate } }, { endDate: { $gte: requestedEndDate } }] }
          ]}
        ]
      });
      
      // Get IDs of products that are already booked
      const bookedProductIds = overlappingBookings.map(booking => booking.productId.toString());
      
      // Filter out products that are already booked
      const availableProducts = products.filter(product => 
        !bookedProductIds.includes(product._id.toString())
      );
      
      return res.status(200).json({ success: true, products: availableProducts });
    }
    
    res.status(200).json({ success: true, products });
  } catch (error) {
    handleError(res, error, "Failed to fetch browse products");
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("ownerId", "username email firstName lastName");
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    
    // Check if startDate and endDate query params are provided
    const { startDate, endDate } = req.query;
    
    if (startDate && endDate) {
      const requestedStartDate = new Date(startDate);
      const requestedEndDate = new Date(endDate);
      
      // Get all bookings that overlap with the requested date range for this product
      const Booking = mongoose.model('Booking');
      const overlappingBookings = await Booking.find({
        productId: product._id,
        $and: [
          { status: { $nin: ['rejected', 'cancelled'] } },
          { $or: [
            // Booking starts during requested period
            { startDate: { $gte: requestedStartDate, $lte: requestedEndDate } },
            // Booking ends during requested period
            { endDate: { $gte: requestedStartDate, $lte: requestedEndDate } },
            // Booking spans the entire requested period
            { $and: [{ startDate: { $lte: requestedStartDate } }, { endDate: { $gte: requestedEndDate } }] }
          ]}
        ]
      });
      
      // Check if product is available for the requested dates
      const isAvailable = overlappingBookings.length === 0;
      
      // If not available, find next available dates
      let nextAvailableDates = [];
      
      if (!isAvailable) {
        // Get all bookings for this product sorted by start date
        const allBookings = await Booking.find({
          productId: product._id,
          status: { $nin: ['rejected', 'cancelled'] },
          endDate: { $gte: new Date() } // Only consider current and future bookings
        }).sort({ startDate: 1 });
        
        // Find gaps between bookings for next available dates
        if (allBookings.length > 0) {
          // Start with today or requested start date (whichever is later)
          let currentDate = new Date();
          if (requestedStartDate > currentDate) {
            currentDate = requestedStartDate;
          }
          
          // Check for gaps between bookings
          for (let i = 0; i < allBookings.length; i++) {
            const booking = allBookings[i];
            
            // If current date is before booking start date, we found a gap
            if (currentDate < booking.startDate) {
              nextAvailableDates.push({
                startDate: currentDate,
                endDate: booking.startDate
              });
            }
            
            // Move current date to after this booking's end date
            currentDate = new Date(booking.endDate);
            currentDate.setDate(currentDate.getDate() + 1); // Add one day
            
            // If this is the last booking, add period after it
            if (i === allBookings.length - 1) {
              nextAvailableDates.push({
                startDate: currentDate,
                endDate: null // Indefinite end date
              });
            }
          }
        } else {
          // No bookings at all, so available from now onwards
          nextAvailableDates.push({
            startDate: new Date(),
            endDate: null // Indefinite end date
          });
        }
      }
      
      return res.status(200).json({ 
        success: true, 
        product,
        availability: {
          isAvailable,
          requestedDates: { startDate: requestedStartDate, endDate: requestedEndDate },
          nextAvailableDates
        }
      });
    }
    
    res.status(200).json({ success: true, product });
  } catch (error) {
    handleError(res, error, "Failed to fetch product");
  }
};

// Check product availability for specific dates
export const checkProductAvailability = async (req, res) => {
  try {
    const { productId } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: "Start date and end date are required" });
    }
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    
    const requestedStartDate = new Date(startDate);
    const requestedEndDate = new Date(endDate);
    
    // Get all bookings that overlap with the requested date range
    const Booking = mongoose.model('Booking');
    const overlappingBookings = await Booking.find({
      productId: product._id,
      $and: [
        { status: { $nin: ['rejected', 'cancelled'] } },
        { $or: [
          // Booking starts during requested period
          { startDate: { $gte: requestedStartDate, $lte: requestedEndDate } },
          // Booking ends during requested period
          { endDate: { $gte: requestedStartDate, $lte: requestedEndDate } },
          // Booking spans the entire requested period
          { $and: [{ startDate: { $lte: requestedStartDate } }, { endDate: { $gte: requestedEndDate } }] }
        ]}
      ]
    });
    
    // Check if product is available for the requested dates
    const isAvailable = overlappingBookings.length === 0;
    
    res.status(200).json({ 
      success: true, 
      isAvailable,
      requestedDates: { startDate: requestedStartDate, endDate: requestedEndDate }
    });
  } catch (error) {
    handleError(res, error, "Failed to check product availability");
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProduct) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, message: "Product updated", product: updatedProduct });
  } catch (error) {
    handleError(res, error, "Failed to update product");
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, message: "Product deleted" });
  } catch (error) {
    handleError(res, error, "Failed to delete product");
  }
};

// Approve product
export const approveProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { status: "approved" }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, message: "Product approved", product });
  } catch (error) {
    handleError(res, error, "Failed to approve product");
  }
};

// Reject product
export const rejectProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { status: "rejected" }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, message: "Product rejected", product });
  } catch (error) {
    handleError(res, error, "Failed to reject product");
  }
};

// Get current booking status of a product
export const getProductBookingStatus = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    
    const Booking = mongoose.model('Booking');
    const now = new Date();
    
    // Get current active booking (if any)
    const currentBooking = await Booking.findOne({
      productId: productId,
      status: { $in: ['confirmed', 'accepted', 'in_rental'] },
      paymentStatus: { $in: ['paid', 'confirmed'] },
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).populate('renterId', 'firstName lastName username');
    
    // Get next upcoming booking
    const nextBooking = await Booking.findOne({
      productId: productId,
      status: { $in: ['confirmed', 'accepted', 'pending_payment'] },
      paymentStatus: { $in: ['paid', 'pending', 'confirmed'] },
      startDate: { $gt: now }
    }).sort({ startDate: 1 }).populate('renterId', 'firstName lastName username');
    
    // Get all future bookings for availability calendar
    const futureBookings = await Booking.find({
      productId: productId,
      status: { $in: ['confirmed', 'accepted', 'pending_payment', 'in_rental'] },
      paymentStatus: { $in: ['paid', 'pending', 'confirmed'] },
      endDate: { $gte: now }
    }).sort({ startDate: 1 }).select('startDate endDate status paymentStatus');
    
    // Determine current status
    let currentStatus = 'available';
    let statusMessage = 'This product is currently available for rent';
    
    if (currentBooking) {
      currentStatus = 'rented';
      statusMessage = `Currently rented until ${currentBooking.endDate.toLocaleDateString()}`;
    } else if (nextBooking && nextBooking.startDate <= new Date(now.getTime() + 24 * 60 * 60 * 1000)) { // Within 24 hours
      currentStatus = 'preparing';
      statusMessage = `Preparing for next rental on ${nextBooking.startDate.toLocaleDateString()}`;
    }
    
    // Calculate next available date
    let nextAvailableDate = now;
    if (futureBookings.length > 0) {
      // Find the first gap in bookings or after the last booking
      const sortedBookings = futureBookings.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      let currentDate = now;
      
      for (const booking of sortedBookings) {
        if (currentDate < new Date(booking.startDate)) {
          // Found a gap
          nextAvailableDate = currentDate;
          break;
        }
        currentDate = new Date(booking.endDate);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // If no gap found, available after last booking
      if (nextAvailableDate <= now) {
        const lastBooking = sortedBookings[sortedBookings.length - 1];
        nextAvailableDate = new Date(lastBooking.endDate);
        nextAvailableDate.setDate(nextAvailableDate.getDate() + 1);
      }
    }
    
    res.json({
      success: true,
      productId,
      currentStatus,
      statusMessage,
      currentBooking: currentBooking ? {
        id: currentBooking._id,
        renter: currentBooking.renterId,
        startDate: currentBooking.startDate,
        endDate: currentBooking.endDate,
        status: currentBooking.status
      } : null,
      nextBooking: nextBooking ? {
        id: nextBooking._id,
        renter: nextBooking.renterId,
        startDate: nextBooking.startDate,
        endDate: nextBooking.endDate,
        status: nextBooking.status
      } : null,
      nextAvailableDate,
      totalActiveBookings: futureBookings.length,
      futureBookings: futureBookings.map(booking => ({
        startDate: booking.startDate,
        endDate: booking.endDate,
        status: booking.status,
        paymentStatus: booking.paymentStatus
      }))
    });
  } catch (error) {
    console.error('Error getting product booking status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get product booking status',
      error: error.message
    });
  }
};
