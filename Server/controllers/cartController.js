import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// Find the user's cart or make an empty one
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

// Send the cart with product details
const sendCart = async (res, cart) => {
  await cart.populate("items.product", "name price discountPrice images stock");
  res.json({ success: true, cart });
};

// GET /api/cart
export const getCart = async (req, res) => {
  const cart = await getOrCreateCart(req.userId);
  await sendCart(res, cart);
};

// POST /api/cart   body: { productId, size, color, quantity }
export const addToCart = async (req, res) => {
  const { productId, size, color, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const cart = await getOrCreateCart(req.userId);

  // same product + size + color: increase quantity
  const item = cart.items.find(
    (i) => i.product.toString() === productId && i.size === size && i.color === color
  );

  if (item) item.quantity += Number(quantity);
  else cart.items.push({ product: productId, size, color, quantity });

  await cart.save();
  await sendCart(res, cart);
};

// PUT /api/cart/:itemId   body: { quantity }
export const updateCartItem = async (req, res) => {
  const cart = await getOrCreateCart(req.userId);
  const item = cart.items.id(req.params.itemId);

  if (!item) {
    res.status(404);
    throw new Error("Item not found in cart");
  }

  if (Number(req.body.quantity) < 1) cart.items.pull(req.params.itemId);
  else item.quantity = Number(req.body.quantity);

  await cart.save();
  await sendCart(res, cart);
};

// DELETE /api/cart/:itemId
export const removeCartItem = async (req, res) => {
  const cart = await getOrCreateCart(req.userId);
  cart.items.pull(req.params.itemId);
  await cart.save();
  await sendCart(res, cart);
};

// DELETE /api/cart
export const clearCart = async (req, res) => {
  const cart = await getOrCreateCart(req.userId);
  cart.items = [];
  await cart.save();
  res.json({ success: true, cart });
};