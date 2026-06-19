import mongoose from "mongoose";
import Review from "../models/Review.js";
import Product from "../models/Product.js";
import LibraryItem from "../models/LibraryItem.js";

// Helper function to dynamically aggregate and update Product rating statistics
export const updateProductRating = async (productId) => {
    const stats = await Review.aggregate([
        { $match: { product_id: new mongoose.Types.ObjectId(productId) } },
        {
            $group: {
                _id: null,
                averageRating: { $avg: "$rating" },
                ratingCount: { $sum: 1 }
            }
        }
    ]);

    const average_rating = stats[0] ? Math.round(stats[0].averageRating * 10) / 10 : 0;
    const rating_count = stats[0] ? stats[0].ratingCount : 0;

    await Product.findByIdAndUpdate(productId, { average_rating, rating_count });
};

// 1. Create Review (POST /api/reviews)
export const createReview = async (req, res) => {
    try {
        const { product_id, rating, comment } = req.body;
        const buyer_id = req.userId;

        if (!product_id || rating === undefined) {
            return res.status(400).json({ success: false, message: "Product ID and rating are required" });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
        }

        if (!mongoose.Types.ObjectId.isValid(product_id)) {
            return res.status(400).json({ success: false, message: "Invalid product ID format" });
        }

        // Rule: Only buyers can review (check LibraryItem)
        const libraryItem = await LibraryItem.findOne({ buyer_id, product_id });
        if (!libraryItem) {
            return res.status(403).json({ success: false, message: "You must purchase the product before writing a review" });
        }

        // Rule: One review per buyer per product
        const existingReview = await Review.findOne({ buyer_id, product_id });
        if (existingReview) {
            return res.status(400).json({ success: false, message: "You have already reviewed this product" });
        }

        const review = await Review.create({
            product_id,
            buyer_id,
            rating,
            comment: comment || ""
        });

        // Recalculate statistics
        await updateProductRating(product_id);

        res.status(201).json({
            success: true,
            message: "Review created successfully",
            review
        });
    } catch (error) {
        console.error("Create Review Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// 2. Update Review (PUT /api/reviews/:id)
export const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const buyer_id = req.userId;

        if (rating !== undefined && (rating < 1 || rating > 5)) {
            return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid review ID format" });
        }

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        // Check ownership
        if (review.buyer_id.toString() !== buyer_id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to update this review" });
        }

        if (rating !== undefined) review.rating = rating;
        if (comment !== undefined) review.comment = comment;

        await review.save();

        // Recalculate statistics
        await updateProductRating(review.product_id);

        res.status(200).json({
            success: true,
            message: "Review updated successfully",
            review
        });
    } catch (error) {
        console.error("Update Review Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// 3. Delete Review (DELETE /api/reviews/:id)
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const buyer_id = req.userId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid review ID format" });
        }

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        // Check ownership
        if (review.buyer_id.toString() !== buyer_id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to delete this review" });
        }

        const productId = review.product_id;
        await Review.findByIdAndDelete(id);

        // Recalculate statistics
        await updateProductRating(productId);

        res.status(200).json({
            success: true,
            message: "Review deleted successfully"
        });
    } catch (error) {
        console.error("Delete Review Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// 4. Get Product Reviews (GET /api/reviews/product/:productId)
export const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID format" });
        }

        const reviews = await Review.find({ product_id: productId })
            .populate("buyer_id", "name username avatar_url")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Product reviews fetched successfully",
            reviews
        });
    } catch (error) {
        console.error("Get Product Reviews Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
