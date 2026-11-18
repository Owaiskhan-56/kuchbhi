import dotenv from "dotenv/config";
import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express"; //taking from package
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

import webhookRoutes from "./routes/webhookRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

// Load .env values and connect to the database
connectDB();

const app = express();

// Middlewares
app.use(cors({ origin: [process.env.CLIENT_URL, process.env.ADMIN_URL] }));

// Webhook needs the RAW body, so it comes BEFORE express.json()
app.use("/api/webhooks", express.raw({ type: "application/json" }), webhookRoutes);

app.use(express.json()); // lets us read JSON from req.body

app.use(clerkMiddleware());  // reads the Clerk token on every request

// Test route
app.get("/", (req, res) => {
  res.json({ success: true, message: "Sindhi Dress Store API is running" });
});

app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews", reviewRoutes);
// Routes will be added here

// Error middlewares must always be LAST
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});