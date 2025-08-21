import express from "express";
import {
  addReview,
  getReviewsForProduct,
  getReviewsByUser
} from "../controllers/review.controller.js";

const router = express.Router();

// Reviews
router.post("/", addReview);
router.get("/product/:productId", getReviewsForProduct);
router.get("/user/:clerkId", getReviewsByUser);

export default router;
