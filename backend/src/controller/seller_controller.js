import User from "../models/User.js";
import Product from "../models/Product.js";
import OrderItem from "../models/OrderItem.js";
import mongoose from "mongoose";

export const setupSeller = async (req, res) => {
    try {
        const {
            upi_id,
            upi_name,
            username,
            bio,
            website,
            twitter,
            instagram,
            github,
            linkedin
        } = req.body;
        const user_id = req.userId;

        // 0. Check if user already has a username set (cannot change it)
        if (req.user && req.user.username) {
            return res.status(400).json({ success: false, message: "Username has already been set and cannot be changed" });
        }

        // 1. UPI ID Format Validation
        const upiValidation = (/^[a-zA-Z0-9._-]+@[a-zA-Z0-9_-]+$/).test(upi_id);

        // 2. All fields present check
        if (!username)
            return res.status(400).json({
                message: "Username is required"
            });

        if (!upi_id)
            return res.status(400).json({
                message: "UPI ID is required"
            });

        if (!upi_name)
            return res.status(400).json({
                message: "Account holder name is required"
            });

        // 3. Username Length Check
        if (username.length < 3 || username.length > 30) {
            return res.status(400).json({ success: false, message: "Username must be between 3 and 30 characters" });
        }

        // 4. Username Allowed & Characters Check (Enforce lowercase)
        const usernameRegex = /^[a-z0-9_-]+$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).json({ success: false, message: "Username can only contain lowercase letters, numbers, underscores, and hyphens." });
        }

        // 5. UPI validation check
        if (!upiValidation) {
            return res.status(400).json({ success: false, message: "Invalid UPI ID" });
        }

        // 6. Username uniqueness (excluding current user)
        const existingUser = await User.findOne({ username: username.toLowerCase() });
        if (existingUser && existingUser._id.toString() !== user_id) {
            return res.status(400).json({ success: false, message: "Username already exists" });
        }

        // 7. Save to Database
        const user = await User.findByIdAndUpdate(
            user_id,
            {
                upi_id,
                upi_name,
                username: username.toLowerCase(),
                is_seller: true,
                bio: bio || "",
                website: website || "",
                twitter: twitter || "",
                instagram: instagram || "",
                github: github || "",
                linkedin: linkedin || ""
            },
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, message: "Seller setup completed successfully", user });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getSellerProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, message: "Seller profile fetched successfully", user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const updateSellerProfile = async (req, res) => {
    try {
        const {
            upi_id,
            upi_name,
            bio,
            website,
            twitter,
            instagram,
            github,
            linkedin
        } = req.body;
        const user_id = req.userId;

        // UPI ID Validation if provided
        if (upi_id) {
            const upiValidation = (/^[a-zA-Z0-9._-]+@[a-zA-Z0-9_-]+$/).test(upi_id);
            if (!upiValidation) {
                return res.status(400).json({ success: false, message: "Invalid UPI ID" });
            }
        }

        // Prepare the update object with only fields that are provided
        const updateData = {};
        if (upi_id !== undefined) updateData.upi_id = upi_id;
        if (upi_name !== undefined) updateData.upi_name = upi_name;
        if (bio !== undefined) updateData.bio = bio;
        if (website !== undefined) updateData.website = website;
        if (twitter !== undefined) updateData.twitter = twitter;
        if (instagram !== undefined) updateData.instagram = instagram;
        if (github !== undefined) updateData.github = github;
        if (linkedin !== undefined) updateData.linkedin = linkedin;

        const user = await User.findByIdAndUpdate(user_id, updateData, { new: true, runValidators: true });
        res.status(200).json({ success: true, message: "Seller profile updated successfully", user });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getSellerPublicProfile = async (req, res) => {
    try {
        const { username } = req.params;

        // Find user by username and ensure they are a seller
        const user = await User.findOne({
            username: username.toLowerCase(),
            is_seller: true
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "Seller not found" });
        }

        // Return public profile details (exclude sensitive fields like upi_id, upi_name, etc.)
        res.status(200).json({
            success: true,
            message: "Seller public profile fetched successfully",
            seller: {
                _id: user._id,
                name: user.name,
                username: user.username,
                avatar_url: user.avatar_url,
                bio: user.bio,
                website: user.website,
                twitter: user.twitter,
                instagram: user.instagram,
                github: user.github,
                linkedin: user.linkedin,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getSellerDashboard = async (req, res) => {
    try {
        const seller_id = req.userId;
        const sellerIdObj = new mongoose.Types.ObjectId(seller_id);

        // 1. Dashboard Summary:
        const totalProducts = await Product.countDocuments({ seller_id });

        const productStats = await Product.aggregate([
            { $match: { seller_id: sellerIdObj } },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$total_sales" },
                    totalDownloads: { $sum: "$download_count" }
                }
            }
        ]);

        const totalSales = productStats[0]?.totalSales || 0;
        const totalDownloads = productStats[0]?.totalDownloads || 0;

        const revenueStats = await OrderItem.aggregate([
            { $match: { seller_id: sellerIdObj } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$seller_earning" }
                }
            }
        ]);

        const totalRevenue = (revenueStats[0]?.totalRevenue || 0) / 100;

        // 2. Recent Purchases:
        const recentPurchases = await OrderItem.find({ seller_id })
            .populate({
                path: "order_id",
                populate: {
                    path: "buyer_id",
                    select: "name username email avatar_url"
                }
            })
            .populate("product_id", "title price thumbnail_url slug")
            .sort({ createdAt: -1 })
            .limit(5);

        const mappedRecentPurchases = recentPurchases.map(item => ({
            _id: item._id,
            product: item.product_id,
            buyer: item.order_id?.buyer_id || null,
            price_paid: item.price_at_purchase / 100, // in rupees
            purchased_at: item.createdAt
        }));

        // 3. Seller Analytics (Monthly sales/revenue stats for the last 6 months)
        const analyticsRaw = await OrderItem.aggregate([
            { $match: { seller_id: sellerIdObj } },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    salesCount: { $sum: 1 },
                    revenue: { $sum: "$seller_earning" }
                }
            },
            { $sort: { "_id.year": -1, "_id.month": -1 } },
            { $limit: 6 }
        ]);

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const analytics = analyticsRaw.map(item => {
            const monthStr = monthNames[item._id.month - 1];
            return {
                label: `${monthStr} ${item._id.year}`,
                sales: item.salesCount,
                revenue: item.revenue / 100 // in Rupees
            };
        }).reverse();

        res.status(200).json({
            success: true,
            message: "Seller dashboard statistics fetched successfully",
            summary: {
                totalProducts,
                totalSales,
                totalRevenue,
                totalDownloads
            },
            recentPurchases: mappedRecentPurchases,
            analytics
        });
    } catch (error) {
        console.error("Seller Dashboard Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
