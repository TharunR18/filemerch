import mongoose from "mongoose";
/*
 * OrderItem
 * One document per product per order — the line items of a checkout.
 *
 * Why store price_at_purchase?
 *   Product prices can change after purchase. Storing the price at the
 *   time of transaction ensures receipts, revenue reports, and payouts
 *   are always accurate regardless of future price edits.
 *
 * Why store seller_id here?
 *   Makes seller revenue queries efficient: you can query all OrderItems
 *   where seller_id = X without joining through Orders and Products.
 *
 * Why store seller_earning and platform_fee here?
 *   Same reason — computed and frozen at purchase time. If you change
 *   your platform fee percentage tomorrow, old transactions stay correct.
 */
const orderItemSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // Denormalized for fast seller dashboard queries
    seller_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Price the buyer paid, in INR paise — snapshot at purchase time
    price_at_purchase: {
      type: Number,
      required: true,
    },

    // Your cut (set to 0 for now; increase when you add platform fees)
    platform_fee: {
      type: Number,
      default: 0,
    },

    // What the seller earns = price_at_purchase - platform_fee
    seller_earning: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
orderItemSchema.index({ order_id: 1 }); // Fetch all items in an order
orderItemSchema.index({ seller_id: 1, createdAt: -1 }); // Seller's sales history
orderItemSchema.index({ product_id: 1 }); // Sales per product
// Compound: seller dashboard filtered by status requires joining Order,
// but this index speeds up the OrderItem side of that join
orderItemSchema.index({ seller_id: 1, product_id: 1 });


const orderItemModel = mongoose.model("OrderItem", orderItemSchema);

export default orderItemModel;