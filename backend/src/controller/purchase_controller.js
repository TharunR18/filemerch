import mongoose from "mongoose";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import LibraryItem from "../models/LibraryItem.js";
import Product from "../models/Product.js";
import DownloadHistory from "../models/DownloadHistory.js";
import { generateSignedUrl } from "../services/storageService.js";

// 1. Buy Product (POST /api/purchases/buy/:productId)
// Simulates a successful checkout in demo mode
export const buyProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const buyer_id = req.userId;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID format" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Rule: Buyers cannot buy their own products
        if (product.seller_id.toString() === buyer_id.toString()) {
            return res.status(400).json({ success: false, message: "You cannot purchase your own product" });
        }

        // Rule: Buyers cannot purchase the same product twice
        const existingPurchase = await LibraryItem.findOne({ buyer_id, product_id: productId });
        if (existingPurchase) {
            return res.status(400).json({ success: false, message: "You already own this product" });
        }

        // Amount in paise (1 INR = 100 Paise)
        const amountInPaise = Math.round(product.price * 100);

        // Create Order (Simulated / Demo Mode)
        const order = await Order.create({
            buyer_id,
            razorpay_order_id: `order_demo_${Math.random().toString(36).substring(2, 15)}`,
            razorpay_payment_id: `pay_demo_${Math.random().toString(36).substring(2, 15)}`,
            status: "paid",
            total_amount: amountInPaise
        });

        // Create OrderItem
        const orderItem = await OrderItem.create({
            order_id: order._id,
            product_id: product._id,
            seller_id: product.seller_id,
            price_at_purchase: amountInPaise,
            platform_fee: 0,
            seller_earning: amountInPaise
        });

        // Create LibraryItem to grant ownership/access
        const libraryItem = await LibraryItem.create({
            buyer_id,
            product_id: product._id,
            order_item_id: orderItem._id,
            purchased_at: new Date()
        });

        // Increase product sales counter
        product.total_sales = (product.total_sales || 0) + 1;
        await product.save();

        res.status(201).json({
            success: true,
            message: "Product purchased successfully (Demo Mode)",
            orderId: order._id,
            libraryItem
        });
    } catch (error) {
        console.error("Buy Product Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// 2. Get My Purchases (GET /api/purchases/my-purchases)
export const getMyPurchases = async (req, res) => {
    try {
        const buyer_id = req.userId;

        const purchases = await LibraryItem.find({ buyer_id })
            .populate({
                path: "product_id",
                select: "title description price thumbnail_url category slug file_size file_type seller_id",
                populate: {
                    path: "seller_id",
                    select: "name username avatar_url"
                }
            })
            .sort({ purchased_at: -1 });

        res.status(200).json({
            success: true,
            message: "Purchases fetched successfully",
            purchases
        });
    } catch (error) {
        console.error("Get My Purchases Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// 3. Download Product File (GET /api/purchases/download/:productId)
export const downloadProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const buyer_id = req.userId;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID format" });
        }

        // Verify ownership/library item access
        const libraryItem = await LibraryItem.findOne({ buyer_id, product_id: productId });
        if (!libraryItem) {
            return res.status(403).json({ success: false, message: "Access denied. You do not own this product." });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if (!product.file_key) {
            return res.status(404).json({ success: false, message: "No file associated with this product yet" });
        }

        // Generate signed URL
        const signedUrlData = await generateSignedUrl(product.file_key);
        if (!signedUrlData || !signedUrlData.signedUrl) {
            return res.status(500).json({ success: false, message: "Failed to generate download URL" });
        }

        // Increment download counters atomically
        libraryItem.download_count = (libraryItem.download_count || 0) + 1;
        await libraryItem.save();

        product.download_count = (product.download_count || 0) + 1;
        await product.save();

        // Log download event in DownloadHistory
        await DownloadHistory.create({
            buyer_id,
            product_id: product._id
        });

        res.status(200).json({
            success: true,
            message: "Download URL generated successfully",
            downloadUrl: signedUrlData.signedUrl
        });
    } catch (error) {
        console.error("Download Product Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
