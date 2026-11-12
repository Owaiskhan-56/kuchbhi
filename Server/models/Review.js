import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    userName: { type: String, default: "Customer" },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }, // cut off
    rating: { type: Number, required: true, min: 1, max: 5 }, // max is cut off, probably 5
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

// one review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);