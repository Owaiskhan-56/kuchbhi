import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    user: { type: String, required: true, unique: true }, // Clerk user id
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        size: { type: String, default: "" },
        color: { type: String, default: "" },
        quantity: { type: Number, required: true, min: 1, default: 1 },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);