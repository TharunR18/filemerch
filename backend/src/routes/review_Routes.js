import express from "express";
import { createReview, updateReview, deleteReview, getProductReviews } from "../controller/review_controller.js";
import { protect } from "../middleware/protect_middleware.js";

const router = express.Router();

// 1. Create Review (Protected)
router.post("/", protect, createReview);

// 2. Update Review (Protected)
router.put("/:id", protect, updateReview);

// 3. Delete Review (Protected)
router.delete("/:id", protect, deleteReview);

// 4. Get Reviews for Product (Public)
router.get("/product/:productId", getProductReviews);

export default router;
