import mongoose from "mongoose";

/*
 * Review
 * A buyer's rating and comment on a product they purchased.
 *
 * Rules enforced here:
 *   1. One review per buyer per product (compound unique index).
 *   2. Only verified buyers can review — enforce this in the route handler
 *      by checking if a LibraryItem exists for (buyer_id, product_id)
 *      before allowing review creation.
 *
 * When a review is created or updated, the Product document's
 * average_rating and rating_count must be updated atomically:
 *
 *   On create:
 *     new_avg = ((old_avg * old_count) + new_rating) / (old_count + 1)
 *     Product.findByIdAndUpdate(product_id, {
 *       $inc: { rating_count: 1 },
 *       $set: { average_rating: new_avg }
 *     })
 *
 *   On update (rating changed):
 *     new_avg = ((old_avg * count) - old_rating + new_rating) / count
 *     Product.findByIdAndUpdate(product_id, {
 *       $set: { average_rating: new_avg }
 *     })
 *
 *   On delete:
 *     new_avg = count > 1
 *       ? ((old_avg * count) - deleted_rating) / (count - 1)
 *       : 0
 *     Product.findByIdAndUpdate(product_id, {
 *       $inc: { rating_count: -1 },
 *       $set: { average_rating: new_avg }
 *     })
 */
const reviewSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    buyer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },

    comment: {
      type: String,
      maxlength: [1000, "Review cannot exceed 1000 characters"],
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// Compound unique: one review per buyer per product
reviewSchema.index({ product_id: 1, buyer_id: 1 }, { unique: true });
reviewSchema.index({ product_id: 1, createdAt: -1 }); // Reviews list for a product
reviewSchema.index({ buyer_id: 1 }); // All reviews by a user

module.exports = mongoose.model("Review", reviewSchema);
