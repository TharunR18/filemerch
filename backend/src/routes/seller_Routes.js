import express from "express";
import { setupSeller, getSellerProfile, updateSellerProfile, getSellerPublicProfile } from '../controller/seller_controller.js';
import { protect } from '../middleware/protect_middleware.js';

const router = express.Router();

// 1. Setup Seller Profile
router.post("/setup", protect, setupSeller);

// 2. Get Seller Profile
router.get("/profile", protect, getSellerProfile);

// 3. Update Seller Profile
router.put("/update", protect, updateSellerProfile);

// 4. Get Public Seller Profile (No protect middleware - it's public!)
router.get("/:username", getSellerPublicProfile);

export default router;