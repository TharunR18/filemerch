import mongoose from "mongoose";

/*
 * WishlistItem
 * A product saved to a user's wishlist.
 *
 * Why not embed an array of product IDs on the User document?
 *   Embedded arrays work fine for small lists, but they make it hard to:
 *     - Query "how many users wishlisted product X" (analytics)
 *     - Notify users when a wishlisted product goes on sale (future feature)
 *     - Paginate large wishlists efficiently
 *   A separate collection costs slightly more storage but is far more flexible.
 *
 * Toggle logic (in your route handler):
 *   Use findOneAndDelete to remove if exists, or create if not.
 *   The unique index ensures no duplicates even under concurrent requests.
 */
const wishlistItemSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    added_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // added_at is sufficient; no need for updatedAt
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// Compound unique: a user can only wishlist a product once
wishlistItemSchema.index({ user_id: 1, product_id: 1 }, { unique: true });
wishlistItemSchema.index({ user_id: 1, added_at: -1 }); // User's wishlist, sorted
wishlistItemSchema.index({ product_id: 1 }); // Count/list users who saved a product

module.exports = mongoose.model("WishlistItem", wishlistItemSchema);
