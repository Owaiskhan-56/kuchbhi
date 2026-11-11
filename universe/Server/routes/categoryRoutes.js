import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    image: {
      // Image fields are not clearly visible in the screenshot
    },
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);