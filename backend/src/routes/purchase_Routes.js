import express from "express";
import { buyProduct, verifyPayment, getMyPurchases, downloadProduct } from "../controller/purchase_controller.js";
import { protect } from "../middleware/protect_middleware.js";

const router = express.Router();

// 1. Buy Product
router.post("/buy/:productId", protect, buyProduct);

// 1b. Verify Payment
router.post("/verify", protect, verifyPayment);

// 2. Get Purchased Products
router.get("/my-purchases", protect, getMyPurchases);

// 3. Download File (Temporary Signed URL)
router.get("/download/:productId", protect, downloadProduct);

export default router;

