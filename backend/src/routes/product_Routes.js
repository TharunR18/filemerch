import express from "express";
import { createProduct, getActiveProducts, getSellerProducts, getProductBySlug, updateProduct, deleteProduct, productUpload, getRelatedProducts, thumbnailUpload } from "../controller/product_controller.js";
import { protect, seller } from "../middleware/protect_middleware.js";
import upload from "../middleware/upload_middleware.js";
import multer from "multer";

const router = express.Router();

// 1. Marketplace: Get all active products (Public)
router.get("/", getActiveProducts);

// 2. Get Seller's own products (Protected, must be seller)
router.get("/myProducts", protect, seller, getSellerProducts);

// 3. Create Product (Protected, must be seller)
router.post("/", protect, seller, (req, res, next) => {
    upload.fields([
      { name: "thumbnail", maxCount: 1 },
      { name: "file", maxCount: 1 }
    ])(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ success: false, message: "File size exceeds limit of 50 MB" });
          }
          return res.status(400).json({ success: false, message: err.message });
        }
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  createProduct
);

// 4. Get Related Products (Public)
router.get("/:id/related", getRelatedProducts);

// 5. Get Product Details by Slug or ID (Public)
router.get("/:slug", getProductBySlug);

// 5. Update Product (Protected, must be seller & owner)
router.patch("/:id", protect, seller, updateProduct);

// 6. Delete Product (Protected, must be seller & owner)
router.delete("/:id", protect, seller, deleteProduct);

// 7. Upload Product File (Protected, must be seller & owner)
router.post("/:id/upload",protect,seller,(req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ success: false, message: "File size exceeds limit of 50 MB" });
          }
          return res.status(400).json({ success: false, message: err.message });
        }
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  productUpload
);

// 8. Upload Thumbnail (Protected, must be seller & owner)
router.post("/:id/upload-thumbnail", protect, seller, (req, res, next) => {
    upload.single("thumbnail")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  thumbnailUpload
);

export default router;
