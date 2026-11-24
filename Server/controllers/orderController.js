import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

const FREE_SHIPPING_ABOVE = 5000;
const SHIPPING_FEE = 250;

// POST /api/orders   body: { shippingAddress, paymentMethod }
export const createOrder = async (req, res) => {
  const { shippingAddress, paymentMethod = "COD" } = req.body;

  // check address fields
  if (
    !shippingAddress?.fullName ||
    !shippingAddress?.phone ||
    !shippingAddress?.address ||
    !shippingAddress?.city
  ) {
    res.status(400);
    throw new Error("Please fill the complete shipping address");
  }

  const cart = await Cart.findOne({ user: req.userId }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Your cart is empty");
  }

  // Build order items using prices from the database
  const items = [];
  for (const item of cart.items) {
    const product = item.product;

    if (!product) {
      res.status(400);
      throw new Error("A product in your cart no longer exists");
    }
    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`${product.name} is out of stock`);
    }

    items.push({
      product: product._id,
      name: product.name,
      image: product.images[0]?.url,
      price: product.discountPrice > 0 ? product.discountPrice : product.price,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
    });
  }

  const itemsPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingPrice = itemsPrice >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE;
  const totalPrice = itemsPrice + shippingPrice;

  const order = await Order.create({
    user: req.userId,
    items,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    totalPrice,
  });

  // Reduce stock and empty the cart
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  }
  cart.items = [];
  await cart.save();

  res.status(201).json({ success: true, order });
};

// GET /api/orders/my
export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.userId }).sort("-createdAt");
  res.json({ success: true, orders });
};

// GET /api/orders/:id
export const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (order.user !== req.userId) {
    res.status(403);
    throw new Error("This is not your order");
  }

  res.json({ success: true, order });
};