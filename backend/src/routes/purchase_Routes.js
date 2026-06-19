import express from "express";
import { buyProduct, getMyPurchases, downloadProduct } from "../controller/purchase_controller.js";
import { protect } from "../middleware/protect_middleware.js";

const router = express.Router();

// 1. Buy Product (Simulated/Demo)
router.post("/buy/:productId", protect, buyProduct);

// 2. Get Purchased Products
router.get("/my-purchases", protect, getMyPurchases);

// 3. Download File (Temporary Signed URL)
router.get("/download/:productId", protect, downloadProduct);

export default router;
