import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/*
 * User
 * Single identity for both buyers and sellers.
 * A user becomes a seller only when they complete seller setup
 * (provide a UPI ID). No separate seller registration needed.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [60, "Name cannot exceed 60 characters"],
    },

    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [
        /^[a-z0-9_-]+$/,
        "Username can only contain letters, numbers, _ and -",
      ],
      default: null,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Null for Google OAuth users — they never set a password
    password_hash: {
      type: String,
      default: null,
      select: false, // Never returned in queries unless explicitly asked
    },

    // Populated only when the user signs up / logs in via Google OAuth
    google_id: {
      type: String,
      default: null,
      sparse: true, // Unique index that allows multiple nulls
    },

    avatar_url: {
      type: String,
      default: null,
    },

    bio: {
      type: String,
      maxlength: [300, "Bio cannot exceed 300 characters"],
      default: "",
    },

    // Public profile links
    website: { type: String, default: "" },
    twitter: { type: String, default: "" },
    instagram: { type: String, default: "" },

    // Seller fields — only relevant when is_seller is true
    upi_id: {
      type: String,
      default: null,
    },

    // Flips to true when seller setup is completed (UPI provided)
    is_seller: {
      type: Boolean,
      default: false,
    },

    // Flips to true after email verification
    is_verified: {
      type: Boolean,
      default: false,
    },

    // For future admin panel support
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // OTP-based password reset
    // Stored as a plain string; you hash it before saving if you want extra security
    reset_otp: {
      type: String,
      default: null,
      select: false,
    },
    otp_expires_at: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
// email is already unique above, which creates an index automatically.
// google_id uses sparse:true so multiple null values are allowed.
userSchema.index({ google_id: 1 }, { unique: true, sparse: true });

// ── Instance Methods ──────────────────────────────────────────────────────────

// Hash password before saving (only runs if password_hash was modified)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password_hash") || !this.password_hash) return next();
  this.password_hash = await bcrypt.hash(this.password_hash, 12);
  next();
});

// Compare a plain-text password against the stored hash
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password_hash);
};

// Return a safe public profile (no sensitive fields)
userSchema.methods.toPublicProfile = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    avatar_url: this.avatar_url,
    bio: this.bio,
    website: this.website,
    twitter: this.twitter,
    instagram: this.instagram,
    is_seller: this.is_seller,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("User", userSchema);
