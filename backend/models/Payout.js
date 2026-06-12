import mongoose from "mongoose";

/*
 * Payout
 * Tracks money owed to sellers that you (the platform owner) will
 * manually transfer via UPI.
 *
 * How it works in your current model:
 *   1. Buyer pays → Razorpay sends money to your account.
 *   2. One Payout document is created per OrderItem (one per seller).
 *      Status starts as "pending".
 *   3. You log into your admin dashboard, see pending payouts, and
 *      manually send money to the seller's UPI ID.
 *   4. You mark the payout as "paid" and record your transaction notes
 *      (e.g. UTR number, timestamp).
 *
 * Why snapshot upi_id here?
 *   The seller might change their UPI ID after the sale. Snapshotting it
 *   at payout creation ensures you always have the correct ID for that
 *   specific transaction, and the audit trail is clean.
 */
const payoutSchema = new mongoose.Schema(
  {
    seller_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Link to the specific sale that generated this payout
    order_item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderItem",
      required: true,
      unique: true, // One payout per order item — no double-paying
    },

    // Amount in INR paise — copied from OrderItem.seller_earning at creation
    amount: {
      type: Number,
      required: true,
    },

    // Seller's UPI ID at the time of payout creation (snapshot)
    upi_id: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "on_hold"],
      default: "pending",
    },

    // Your personal notes: UTR number, payment app used, etc.
    notes: {
      type: String,
      default: "",
    },

    // Set when you mark status as "paid"
    paid_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// Primary admin dashboard query: "show me all pending payouts"
payoutSchema.index({ status: 1, createdAt: -1 });
// Seller's earnings page: "show this seller's payout history"
payoutSchema.index({ seller_id: 1, status: 1 });
payoutSchema.index({ seller_id: 1, createdAt: -1 });
// order_item_id is already unique above (auto-indexed)

module.exports = mongoose.model("Payout", payoutSchema);
