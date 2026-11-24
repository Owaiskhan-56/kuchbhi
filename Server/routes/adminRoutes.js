import express from "express";
import {
  getStats,
  getAllOrders,
  getAdminOrderById,
  updateOrderStatus,
  getAllUsers,
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(protect, adminOnly); // every admin route is protected

router.get("/stats", getStats);
router.get("/orders", getAllOrders);
router.get("/orders/:id", getAdminOrderById);
router.put("/orders/:id/status", updateOrderStatus);
router.get("/users", getAllUsers);

export default router;