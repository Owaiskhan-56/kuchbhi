import Category from "../models/Category.js";
import Product from "../models/Product.js";
import cloudinary, { uploadImage } from "../config/cloudinary.js";

// GET /api/categories  (public)
export const getCategories = async (req, res) => {
  const categories = await Category.find().sort("name");
  res.json({ success: true, categories });
};

// POST /api/categories  (admin)
export const createCategory = async (req, res) => {
  const { name, description } = req.body;

  const exists = await Category.findOne({ name });
  if (exists) {
    res.status(400);
    throw new Error("Category already exists");
  }

  let image = {};
  if (req.file) {
    const result = await uploadImage(req.file.buffer, "sindhi-dress-store/categories");
    image = { url: result.secure_url, public_id: result.public_id };
  }

  const category = await Category.create({ name, description, image });
  res.status(201).json({ success: true, category });
};

// PUT /api/categories/:id  (admin)
export const updateCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  if (req.body.name) category.name = req.body.name;
  if (req.body.description !== undefined) category.description = req.body.description;

  if (req.file) {
    if (category.image.public_id) await cloudinary.uploader.destroy(category.image.public_id);
    const result = await uploadImage(req.file.buffer, "sindhi-dress-store/categories");
    category.image = { url: result.secure_url, public_id: result.public_id };
  }

  await category.save();
  res.json({ success: true, category });
};

// DELETE /api/categories/:id  (admin)
export const deleteCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  const productCount = await Product.countDocuments({ category: category._id });
  if (productCount > 0) {
    res.status(400);
    throw new Error("Cannot delete: this category has products");
  }

  if (category.image.public_id) await cloudinary.uploader.destroy(category.image.public_id);
  await category.deleteOne();

  res.json({ success: true, message: "Category deleted" });
};