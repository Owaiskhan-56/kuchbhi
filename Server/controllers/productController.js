import Product from "../models/Product.js";
import cloudinary, { uploadImage } from "../config/cloudinary.js";
import ApiFeatures from "../utils/apiFeatures.js";

// "S,M,L" -> ["S","M","L"]
const toArray = (value) =>
  value ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];

const toBoolean = (value) => value === true || value === "true";

// Upload all files and return [{url, public_id}]
const uploadImages = async (files) => {
  const images = [];
  for (const file of files) {
    const result = await uploadImage(file.buffer, "sindhi-dress-store/products");
    images.push({ url: result.secure_url, public_id: result.public_id });
  }
  return images;
};

// GET /api/products  (public)
export const getProducts = async (req, res) => {
  const limit = Number(req.query.limit) || 12;
  const page = Number(req.query.page) || 1;

  // count with the same search and filters (no pagination)
  const total = await new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .query.countDocuments();

  const products = await new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .sort()
    .paginate()
    .query.populate("category", "name");

  res.json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    products,
  });
};

// GET /api/products/:id  (public)
export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category", "name");

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({ success: true, product });
};

// POST /api/products  (admin)
export const createProduct = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error("Please upload at least one image");
  }

  const images = await uploadImages(req.files);

  const product = await Product.create({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    discountPrice: req.body.discountPrice || 0,
    category: req.body.category,
    gender: req.body.gender,
    fabric: req.body.fabric,
    embroidery: req.body.embroidery,
    stock: req.body.stock,
    isFeatured: toBoolean(req.body.isFeatured),
    sizes: toArray(req.body.sizes),
    colors: toArray(req.body.colors),
    images,
  });

  res.status(201).json({ success: true, product });
};

// PUT /api/products/:id  (admin)
export const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const fields = [
    "name", "description", "price", "discountPrice",
    "category", "gender", "fabric", "embroidery", "stock",
  ];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) product[field] = req.body[field];
  });

  if (req.body.sizes !== undefined) product.sizes = toArray(req.body.sizes);
  if (req.body.colors !== undefined) product.colors = toArray(req.body.colors);
  if (req.body.isFeatured !== undefined) product.isFeatured = toBoolean(req.body.isFeatured);

  // New images replace the old ones
  if (req.files && req.files.length > 0) {
    for (const img of product.images) await cloudinary.uploader.destroy(img.public_id);
    product.images = await uploadImages(req.files);
  }

  await product.save();
  res.json({ success: true, product });
};

// DELETE /api/products/:id  (admin)
export const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  for (const img of product.images) await cloudinary.uploader.destroy(img.public_id);
  await product.deleteOne();

  res.json({ success: true, message: "Product deleted" });
};