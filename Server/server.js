
import express from "express";
import cors from "cors";
import { dirname } from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

import webhookRoutes from "./routes/webhookRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

connectDB();

const app = express();

// Middleware
app.use(cors({ origin: [process.env.CLIENT_URL, process.env.ADMIN_URL] }));

// Webhook route (raw body is needed before express.json())
app.use("/api/webhooks", express.raw({ type: "application/json" }), webhookRoutes);

app.use(express.json()); // lets us read JSON from req.body

app.use(clearMiddleware()); // clears the cart token on every request

// Test route
app.get("/", (req, res) => {
  res.json({ success: true, message: "Shopify Dress Store API is running" });
});

app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
// Routes will be added here

// Error middlewares must always be LAST
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
