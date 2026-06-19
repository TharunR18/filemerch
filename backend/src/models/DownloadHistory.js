import mongoose from "mongoose";

/*
 * DownloadHistory
 * Logs every time a user downloads a file they purchased.
 * Helps with analytics and audit trails.
 */
const downloadHistorySchema = new mongoose.Schema(
  {
    buyer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    downloaded_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

downloadHistorySchema.index({ buyer_id: 1 });
downloadHistorySchema.index({ product_id: 1 });
downloadHistorySchema.index({ downloaded_at: -1 });

const downloadHistoryModel = mongoose.model("DownloadHistory", downloadHistorySchema);

export default downloadHistoryModel;
