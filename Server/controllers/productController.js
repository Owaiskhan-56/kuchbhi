// UPDATE product
export const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const fields = ["name", "description", "price", "category", "stock"];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) product[field] = req.body[field];
  });

  if (req.body.sizes) product.sizes = JSON.parse(req.body.sizes);
  if (req.body.colors) product.colors = JSON.parse(req.body.colors);
  if (req.body.isFeatured) product.isFeatured = JSON.parse(req.body.isFeatured);

  // If new images were uploaded, replace the old ones
  if (req.files && req.files.length > 0) {
    for (const img of product.images) {
      await cloudinary.uploader.destroy(img.public_id);
    }
    product.images = await uploadImages(req.files);
  }

  await product.save();
  res.json({ success: true, product });
};

// DELETE product
export const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  for (const img of product.images) {
    await cloudinary.uploader.destroy(img.public_id);
  }
  await product.deleteOne();

  res.json({ success: true, message: "Product deleted" });
};
