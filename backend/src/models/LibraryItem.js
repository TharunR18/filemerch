import mongoose from "mongoose";

/*
 * LibraryItem
 * A buyer's access record for a product they purchased.
 * This is the "My Library" feature — the list of files a user can download.
 *
 * Why not just query Orders + OrderItems?
 *   The library page is read frequently. Joining three collections
 *   (Order → OrderItem → Product) every time a buyer opens their library
 *   is expensive. LibraryItem is a denormalized, read-optimized view
 *   of "what can this user download right now."
 *
 * Access check for downloads:
 *   Instead of checking if a user paid for something, just check if a
 *   LibraryItem exists for (buyer_id, product_id). Fast single-document lookup.
 */
const libraryItemSchema = new mongoose.Schema(
  {
    buyer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // Trace back to the exact transaction that granted access
    order_item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderItem",
      required: true,
    },

    // Track how many times the buyer has downloaded the file
    // Useful for analytics; you can also enforce a download limit here
    download_count: {
      type: Number,
      default: 0,
    },

    // When the product was purchased (set to createdAt alias for clarity)
    purchased_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// Compound unique: a buyer can only own a product once
// Also the primary access-check query: find({ buyer_id, product_id })
libraryItemSchema.index({ buyer_id: 1, product_id: 1 }, { unique: true });
libraryItemSchema.index({ buyer_id: 1, purchased_at: -1 }); // Library list, sorted

const libraryItemModel = mongoose.model("LibraryItem", libraryItemSchema);

export default libraryItemModel;
