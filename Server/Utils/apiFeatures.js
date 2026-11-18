class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;             // Mongoose query, e.g. Product.find()
    this.queryString = queryString; // req.query
  }

  // ?keyword=ajrak
  search() {
    if (this.queryString.keyword) {
      this.query = this.query.find({
        name: { $regex: this.queryString.keyword, $options: "i" },
      });
    }
    return this;
  }

  // ?category=ID&gender=Men&fabric=Cotton&minPrice=1000&maxPrice=5000&isFeatured=true
  filter() {
    const { category, gender, fabric, minPrice, maxPrice, isFeatured } = this.queryString;
    const filters = {};

    if (category) filters.category = category;
    if (gender) filters.gender = gender;
    if (fabric) filters.fabric = { $regex: fabric, $options: "i" };
    if (isFeatured) filters.isFeatured = isFeatured === "true";

    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = Number(minPrice);
      if (maxPrice) filters.price.$lte = Number(maxPrice);
    }

    this.query = this.query.find(filters);
    return this;
  }

  // ?sort=newest | price-low | price-high | rating
  sort() {
    const options = {
      newest: "-createdAt",
      "price-low": "price",
      "price-high": "-price",
      rating: "-ratings",
    };
    this.query = this.query.sort(options[this.queryString.sort] || "-createdAt");
    return this;
  }

  // ?page=2&limit=12
  paginate() {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 12;
    this.query = this.query.skip((page - 1) * limit).limit(limit);
    return this;
  }
}

export default ApiFeatures;