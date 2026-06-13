import mongoose from "mongoose";
import slugify from "slugify";

/*
 * Product
 * A digital product listed by a seller.
 * Stores both the public thumbnail URL and the private R2 file key.
 * Denormalized counters (total_sales, average_rating) avoid expensive
 * aggregation queries on every product card render.
 */
const productSchema = new mongoose.Schema(
  {
    seller_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    // URL-friendly identifier used in product page routes (/products/:slug)
    // Generated automatically from title on save
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: [
          "Education",
          "Programming",
          "Design",
          "AI",
          "Business",
          "Media",
          "3D & Game Assets",
          "Productivity",
          "Others"
        ],
        message: "{VALUE} is not a valid category"
      }
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: "Cannot have more than 10 tags",
      },
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    // Cloudflare R2 public URL for the product thumbnail image
    thumbnail_url: {
      type: String,
      default: null,
    },

    // The R2 object key (path inside your bucket), e.g. "products/abc123/file.zip"
    // Used to generate fresh signed URLs and to delete the file from R2
    file_key: {
      type: String,
      default: null,
    },

    file_size: {
      type: Number, // In bytes
      default: null,
    },

    // MIME type or a friendly label like "PDF", "ZIP", "FIGMA"
    file_type: {
      type: String,
      default: null,
    },

    // Only published products appear in the marketplace
    is_published: {
      type: Boolean,
      default: false,
    },

    // ── Denormalized counters ─────────────────────────────────────────────────
    // These are updated via atomic $inc operations whenever an order is paid
    // or a review is submitted — never recomputed from scratch.
    total_sales: {
      type: Number,
      default: 0,
    },

    // Recomputed on each review create/update using:
    // new_avg = ((old_avg * rating_count) + new_rating) / (rating_count + 1)
    average_rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    rating_count: {
      type: Number,
      default: 0,
    },

    download_count: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
productSchema.index({ seller_id: 1 });
productSchema.index({ category: 1, is_published: 1 });
productSchema.index({ tags: 1 }); // Multikey index — one entry per tag value
productSchema.index({ average_rating: -1 }); // For "top rated" sort
productSchema.index({ createdAt: -1 }); // For "newest" sort
productSchema.index({ total_sales: -1 }); // For "best selling" sort
// Compound index powers filtered browsing (category + sort by price or rating)
productSchema.index({ category: 1, price: 1, average_rating: -1 });
// Text index for search across title, description, and tags
productSchema.index({ title: "text", description: "text", tags: "text" });

// ── Hooks ─────────────────────────────────────────────────────────────────────

// Auto-generate slug from title before saving
// Appends a short random suffix to handle duplicate titles
productSchema.pre("validate", function () {
  if (this.isModified("title") || this.isNew) {
    const base = slugify(this.title, { lower: true, strict: true });
    const suffix = Math.random().toString(36).substring(2, 7);
    this.slug = `${base}-${suffix}`;
  }
});

export default mongoose.model("Product", productSchema);
