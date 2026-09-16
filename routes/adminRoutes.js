import express from "express";

import {
  getAdminDashboard,
} from "../controllers/adminController.js";

import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

// ==========================================
// ADMIN DASHBOARD
// ==========================================

router.get(
  "/dashboard",
  protect,
  adminOnly,
  getAdminDashboard
);

export default router;