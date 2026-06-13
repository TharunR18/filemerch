import mongoose from "mongoose";
import Product from "../models/Product.js";

// 1. Create Product: POST /api/products
// Must be seller
// Validations: Title required, Price >= 10, Category required, Description required
export const createProduct = async (req, res) => {
    try {
        const { title, description, price, category, thumbnail_url, file_key, file_size, file_type, tags } = req.body;
        const seller_id = req.userId;

        // Validations
        if (!title) {
            return res.status(400).json({ success: false, message: "Title is required" });
        }
        if (!description) {
            return res.status(400).json({ success: false, message: "Description is required" });
        }
        if (!category) {
            return res.status(400).json({ success: false, message: "Category is required" });
        }
        if (price === undefined || price < 10) {
            return res.status(400).json({ success: false, message: "Price must be at least 10 INR" });
        }

        const product = await Product.create({
            seller_id,
            title,
            description,
            price,
            category,
            thumbnail_url: thumbnail_url || null,
            file_key: file_key || null,
            file_size: file_size || null,
            file_type: file_type || null,
            tags: tags || [],
            is_published: true
        });

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product: {
                title: product.title,
                description: product.description,
                price: product.price,
                category: product.category,
                _id: product._id,
                seller_id: product.seller_id,
                slug: product.slug,
                is_published: product.is_published,
                createdAt: product.createdAt
            }
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error("Create Product Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// 2. Get All Active Products (Marketplace): GET /api/products
export const getActiveProducts = async (req, res) => {
    try {
        const products = await Product.find({ is_published: true })
            .populate("seller_id", "username name avatar_url")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Active products fetched successfully",
            products
        });
    } catch (error) {
        console.error("Get Active Products Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// 3. Get Seller's Own Products: GET /api/products/myProducts
// Must be seller
export const getSellerProducts = async (req, res) => {
    try {
        const seller_id = req.userId;
        const products = await Product.find({ seller_id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Seller products fetched successfully",
            products
        });
    } catch (error) {
        console.error("Get Seller Products Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// 4. Get Single Product by Slug or ID: GET /api/products/:slug
export const getProductBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        let product;
        if (slug.match(/^[0-9a-fA-F]{24}$/)) {
            product = await Product.findById(slug).populate("seller_id", "username name avatar_url");
        } else {
            product = await Product.findOne({ slug }).populate("seller_id", "username name avatar_url");
        }

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.status(200).json({
            success: true,
            message: "Product fetched successfully",
            product
        });
    } catch (error) {
        console.error("Get Product By Slug Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// 5. Update Product: PATCH /api/products/:id
// Must be seller & owner
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const seller_id = req.userId;
        const updates = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid product ID format" });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Verify ownership
        if (product.seller_id.toString() !== seller_id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to update this product" });
        }

        // Validation if price is provided in update
        if (updates.price !== undefined && updates.price < 10) {
            return res.status(400).json({ success: false, message: "Price must be at least 10 INR" });
        }

        // Apply update data
        const allowedUpdates = [
            "title", "description", "price", "category",
            "thumbnail_url", "file_key", "is_published", "tags"
        ];

        allowedUpdates.forEach(key => {
            if (updates[key] !== undefined) {
                product[key] = updates[key];
            }
        });

        await product.save();

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error("Update Product Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// 6. Delete Product: DELETE /api/products/:id
// Must be seller & owner
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const seller_id = req.userId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid product ID format" });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Verify ownership
        if (product.seller_id.toString() !== seller_id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to delete this product" });
        }

        await Product.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (error) {
        console.error("Delete Product Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


export const productUpload = async (req,res) => {

}