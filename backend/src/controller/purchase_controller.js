import mongoose from "mongoose";
import crypto from "crypto";
import razorpayInstance from "../config/razorpay.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import LibraryItem from "../models/LibraryItem.js";
import Product from "../models/Product.js";
import DownloadHistory from "../models/DownloadHistory.js";
import { generateSignedUrl } from "../services/storageService.js";

// 1. Buy Product (POST /api/purchases/buy/:productId)
// Creates a Razorpay Order and returns the details
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

        // Create Razorpay Order
        const options = {
            amount: amountInPaise,
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`
        };
        const razorpayOrder = await razorpayInstance.orders.create(options);

        // Create Order (Status: created)
        const order = await Order.create({
            buyer_id,
            razorpay_order_id: razorpayOrder.id,
            status: "created",
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

        res.status(201).json({
            success: true,
            message: "Razorpay order created successfully",
            key_id: process.env.RAZORPAY_KEY_ID,
            orderId: order._id,
            razorpayOrderId: razorpayOrder.id,
            amount: amountInPaise,
            currency: "INR"
        });
    } catch (error) {
        console.error("Buy Product Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// 1b. Verify Razorpay Payment (POST /api/purchases/verify)
export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const buyer_id = req.userId;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: "Missing required payment fields" });
        }

        // Verify Signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isSignatureValid = expectedSignature === razorpay_signature;

        if (!isSignatureValid) {
            return res.status(400).json({ success: false, message: "Payment verification failed: Invalid signature" });
        }

        // Find the corresponding order
        const order = await Order.findOne({ razorpay_order_id });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // If already paid, return success (Idempotency)
        if (order.status === "paid") {
            return res.status(200).json({
                success: true,
                message: "Payment verified successfully (Already Processed)",
                orderId: order._id
            });
        }

        // Update Order
        order.status = "paid";
        order.razorpay_payment_id = razorpay_payment_id;
        await order.save();

        // Find OrderItems for this order
        const orderItems = await OrderItem.find({ order_id: order._id });

        // Create LibraryItems and update product sales
        const libraryItems = [];
        for (const item of orderItems) {
            const existingLib = await LibraryItem.findOne({ buyer_id: order.buyer_id, product_id: item.product_id });
            if (!existingLib) {
                const libraryItem = await LibraryItem.create({
                    buyer_id: order.buyer_id,
                    product_id: item.product_id,
                    order_item_id: item._id,
                    purchased_at: new Date()
                });
                libraryItems.push(libraryItem);

                // Update product sales
                await Product.findByIdAndUpdate(item.product_id, {
                    $inc: { total_sales: 1 }
                });
            }
        }

        res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            orderId: order._id,
            libraryItems
        });
    } catch (error) {
        console.error("Verify Payment Error:", error);
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
