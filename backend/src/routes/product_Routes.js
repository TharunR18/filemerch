import express from "express";
import { createProduct, getActiveProducts, getSellerProducts, getProductBySlug, updateProduct, deleteProduct } from "../controller/product_controller.js";
import { protect, seller } from "../middleware/protect_middleware.js";

const router = express.Router();

// 1. Marketplace: Get all active products (Public)
router.get("/", getActiveProducts);

// 2. Get Seller's own products (Protected, must be seller)
router.get("/myProducts", protect, seller, getSellerProducts);

// 3. Create Product (Protected, must be seller)
router.post("/", protect, seller, createProduct);

// 4. Get Product Details by Slug or ID (Public)
router.get("/:slug", getProductBySlug);

// 5. Update Product (Protected, must be seller & owner)
router.patch("/:id", protect, seller, updateProduct);

// 6. Delete Product (Protected, must be seller & owner)
router.delete("/:id", protect, seller, deleteProduct);

export default router;
