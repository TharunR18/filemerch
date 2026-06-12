import mongoose from "mongoose";

/*
 * Order
 * Represents a single Razorpay payment session.
 * One order can contain multiple products (via OrderItems).
 *
 * Flow:
 *   1. Buyer initiates checkout → Order is created with status "created"
 *      and a razorpay_order_id from the Razorpay API.
 *   2. Buyer completes payment → Razorpay webhook fires → status → "paid",
 *      razorpay_payment_id is filled in, OrderItems & LibraryItems are created.
 *   3. Payment fails → status → "failed".
 */
const orderSchema = new mongoose.Schema(
  {
    buyer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Created by calling Razorpay's Orders API before showing the payment modal
    razorpay_order_id: {
      type: String,
      required: true,
      unique: true,
    },

    // Filled in after Razorpay confirms payment success via webhook
    razorpay_payment_id: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },

    // Total amount in INR paise (Razorpay uses smallest currency unit)
    // e.g. ₹299 is stored as 29900
    total_amount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
orderSchema.index({ buyer_id: 1, createdAt: -1 }); // Buyer's order history
// razorpay_order_id is already unique above (auto-indexed)

module.exports = mongoose.model("Order", orderSchema);
