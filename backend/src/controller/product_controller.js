import mongoose from "mongoose";
import Product from "../models/Product.js";
import { uploadFile, deleteFile } from "../services/storageService.js";


// 1. Create Product: POST /api/products
// Must be seller
// Validations: Title required, Price >= 10, Category required, Description required
export const createProduct = async (req, res) => {
    try {
        const { title, description, price, category, tags } = req.body;
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

        // Verify files exist
        if (!req.files || !req.files.thumbnail || !req.files.file) {
            return res.status(400).json({ success: false, message: "Both Store Cover Image and Product File are required" });
        }

        const thumbnail = req.files.thumbnail[0];
        const file = req.files.file[0];

        const productId = new mongoose.Types.ObjectId();
        const timestamp = Math.floor(Date.now() / 1000);

        // Upload Cover Image
        const thumb_key = `thumbnails/${productId}/${timestamp}-${thumbnail.originalname}`;
        await uploadFile(thumbnail.buffer, thumb_key);
        const supabaseUrl = process.env.SUPABASE_URL;
        const bucket = process.env.SUPABASE_BUCKET;
        const thumbnail_url = `${supabaseUrl}/storage/v1/object/public/${bucket}/${thumb_key}`;

        // Upload Product File
        const file_key = `products/${productId}/${timestamp}-${file.originalname}`;
        await uploadFile(file.buffer, file_key);

        let parsedTags = [];
        if (tags) {
            try {
                parsedTags = Array.isArray(tags) ? tags : JSON.parse(tags);
            } catch (e) {
                // If it's a comma-separated string
                parsedTags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];
            }
        }

        const fileExtension = file.originalname.split('.').pop();

        const product = await Product.create({
            _id: productId,
            seller_id,
            title,
            description,
            price: Number(price),
            category,
            thumbnail_url,
            file_key,
            file_size: file.size,
            file_type: file.mimetype || fileExtension,
            tags: parsedTags,
            is_published: true
        });

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error("Create Product Error:", error);
        res.status(500).json({ success: false, message: error.message || "Internal server error" });
    }
};

// 2. Get All Active Products (Marketplace): GET /api/products
export const getActiveProducts = async (req, res) => {
    try {
        const { search, category, minPrice, maxPrice, rating, sort } = req.query;

        // Build query object
        const query = { is_published: true };

        // 1. Text Search (title, description, tags)
        if (search) {
            query.$text = { $search: search };
        }

        // 2. Category Filter
        if (category) {
            query.category = category;
        }

        // 3. Price Filter
        if (minPrice !== undefined || maxPrice !== undefined) {
            query.price = {};
            if (minPrice !== undefined && minPrice !== "") {
                query.price.$gte = Number(minPrice);
            }
            if (maxPrice !== undefined && maxPrice !== "") {
                query.price.$lte = Number(maxPrice);
            }
            if (Object.keys(query.price).length === 0) {
                delete query.price;
            }
        }

        // 4. Rating Filter
        if (rating !== undefined && rating !== "") {
            query.average_rating = { $gte: Number(rating) };
        }

        // Build sorting object
        let sortOption = { createdAt: -1 }; // default: newest
        if (sort) {
            switch (sort) {
                case "newest":
                    sortOption = { createdAt: -1 };
                    break;
                case "best-selling":
                case "best_selling":
                    sortOption = { total_sales: -1 };
                    break;
                case "price-low":
                case "price_low":
                    sortOption = { price: 1 };
                    break;
                case "price-high":
                case "price_high":
                    sortOption = { price: -1 };
                    break;
                case "top-rated":
                case "top_rated":
                    sortOption = { average_rating: -1 };
                    break;
                default:
                    sortOption = { createdAt: -1 };
            }
        }

        const products = await Product.find(query)
            .populate("seller_id", "username name avatar_url")
            .sort(sortOption);

        res.status(200).json({
            success: true,
            message: "Active products fetched successfully",
            count: products.length,
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
        const sellerPopulateFields = "username name avatar_url bio website twitter instagram github linkedin createdAt";
        
        if (slug.match(/^[0-9a-fA-F]{24}$/)) {
            product = await Product.findById(slug).populate("seller_id", sellerPopulateFields);
        } else {
            product = await Product.findOne({ slug }).populate("seller_id", sellerPopulateFields);
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

// 7. Upload Product File: POST /api/products/:id/upload
// Must be seller & owner
export const productUpload = async (req, res) => {
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
            return res.status(403).json({ success: false, message: "Not authorized to update this product" });
        }

        // Verify file exists
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        // Delete old file if it exists
        if (product.file_key) {
            try {
                await deleteFile(product.file_key);
            } catch (err) {
                console.error("Failed to delete old product file:", err);
            }
        }

        // Generate file key/path
        const timestamp = Math.floor(Date.now() / 1000);
        const file_key = `products/${product._id}/${timestamp}-${req.file.originalname}`;

        // Upload file to storage
        await uploadFile(req.file.buffer, file_key);

        // Update product document in DB
        const fileExtension = req.file.originalname.split('.').pop();
        product.file_key = file_key;
        product.file_size = req.file.size;
        product.file_type = req.file.mimetype || fileExtension;
        await product.save();

        res.status(200).json({
            success: true,
            message: "File uploaded successfully",
            product: {
                _id: product._id,
                file_key: product.file_key,
                file_size: product.file_size,
                file_type: product.file_type
            }
        });
    } catch (error) {
        console.error("Product Upload Error:", error);
        res.status(500).json({ success: false, message: error.message || "Internal server error" });
    }
};

export const getRelatedProducts = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid product ID format" });
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Find other products in the same category or with overlapping tags, excluding the current one
        const related = await Product.find({
            _id: { $ne: product._id },
            is_published: true,
            $or: [
                { category: product.category },
                { tags: { $in: product.tags } }
            ]
        })
        .populate("seller_id", "username name avatar_url")
        .limit(4);

        res.status(200).json({
            success: true,
            message: "Related products fetched successfully",
            products: related
        });
    } catch (error) {
        console.error("Get Related Products Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// 8. Upload Thumbnail: POST /api/products/:id/upload-thumbnail
export const thumbnailUpload = async (req, res) => {
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

        if (product.seller_id.toString() !== seller_id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to update this product" });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "No thumbnail file uploaded" });
        }

        if (product.thumbnail_url && product.thumbnail_url.includes(process.env.SUPABASE_BUCKET)) {
            try {
                const urlParts = product.thumbnail_url.split(`/storage/v1/object/public/${process.env.SUPABASE_BUCKET}/`);
                if (urlParts.length > 1) {
                    await deleteFile(urlParts[1]);
                }
            } catch (err) {
                console.error("Failed to delete old thumbnail file:", err);
            }
        }

        const timestamp = Math.floor(Date.now() / 1000);
        const file_key = `thumbnails/${product._id}/${timestamp}-${req.file.originalname}`;

        await uploadFile(req.file.buffer, file_key);

        const supabaseUrl = process.env.SUPABASE_URL;
        const bucket = process.env.SUPABASE_BUCKET;
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${file_key}`;

        product.thumbnail_url = publicUrl;
        await product.save();

        res.status(200).json({
            success: true,
            message: "Thumbnail uploaded successfully",
            thumbnail_url: product.thumbnail_url
        });
    } catch (error) {
        console.error("Thumbnail Upload Error:", error);
        res.status(500).json({ success: false, message: error.message || "Internal server error" });
    }
};