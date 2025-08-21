import Review from "../models/review.model.js";
import User from "../models/user.js";

const handleError = (res, error, message = "An error occurred", status = 500) => {
  console.error(error);
  res.status(status).json({ success: false, message, error: error.message });
};

// Add review
export const addReview = async (req, res) => {
  try {
    const { clerkId, bookingId, productId, rating, comment } = req.body;
    const reviewer = await User.findOne({ clerkId });
    if (!reviewer) return res.status(404).json({ success: false, message: "Reviewer not found" });

    const review = await Review.create({
      bookingId,
      productId,
      reviewerId: reviewer._id,
      reviewerClerkId: clerkId,
      rating,
      comment
    });

    res.status(201).json({ success: true, message: "Review added", review });
  } catch (error) {
    handleError(res, error, "Failed to add review");
  }
};

// Get reviews for product
export const getReviewsForProduct = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).populate("reviewerId", "username");
    res.status(200).json({ success: true, reviews });
  } catch (error) {
    handleError(res, error, "Failed to fetch reviews");
  }
};

// Get reviews by user
export const getReviewsByUser = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewerClerkId: req.params.clerkId }).populate("productId", "title");
    res.status(200).json({ success: true, reviews });
  } catch (error) {
    handleError(res, error, "Failed to fetch reviews");
  }
};
