import Review from "../models/Review.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

// Recalculate product rating after add or delete
const updateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });
  const numReviews = reviews.length;
  const average = numReviews
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews
    : 0;

  await Product.findByIdAndUpdate(productId, {
    ratings: Number(average.toFixed(1)),
    numReviews,
  });
};

// GET /api/reviews/product/:productId  (public)
export const getProductReviews = async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId }).sort("-createdAt");
  res.json({ success: true, reviews });
};

// POST /api/reviews/product/:productId   body: { rating, comment }
export const addReview = async (req, res) => {
  const { rating, comment } = req.body;
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const already = await Review.findOne({ user: req.userId, product: productId });
  if (already) {
    res.status(400);
    throw new Error("You have already reviewed this product");
  }

  const user = await User.findOne({ clerkId: req.userId });

  const review = await Review.create({
    user: req.userId,
    userName: user?.name || "Customer",
    product: productId,
    rating,
    comment,
  });

  await updateProductRating(productId);
  res.status(201).json({ success: true, review });
};

// DELETE /api/reviews/:reviewId  (only the owner)
export const deleteReview = async (req, res) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  if (review.user !== req.userId) {
    res.status(403);
    throw new Error("You can delete only your own review");
  }

  await review.deleteOne();
  await updateProductRating(review.product);

  res.json({ success: true, message: "Review deleted" });
};