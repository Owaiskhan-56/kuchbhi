import Wishlist from "../models/Wishlist.js";

// GET /api/wishlist
export const getWishlist = async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.userId });
  if (!wishlist) wishlist = await Wishlist.create({ user: req.userId, products: [] });

  await wishlist.populate("products", "name price discountPrice images ratings stock");
  res.json({ success: true, wishlist });
};

// POST /api/wishlist/:productId  (add if missing, remove if already there)
export const toggleWishlist = async (req, res) => {
  const { productId } = req.params;

  let wishlist = await Wishlist.findOne({ user: req.userId });
  if (!wishlist) wishlist = await Wishlist.create({ user: req.userId, products: [] });

  const index = wishlist.products.findIndex((id) => id.toString() === productId);
  let message;

  if (index > -1) {
    wishlist.products.splice(index, 1);
    message = "Removed from wishlist";
  } else {
    wishlist.products.push(productId);
    message = "Added to wishlist";
  }

  await wishlist.save();
  await wishlist.populate("products", "name price discountPrice images ratings stock");

  res.json({ success: true, message, wishlist });
};