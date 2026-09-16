import express from "express";

import {
  createSubscription,
  getAllMemberships,
  getMySubscription,
  verifySubscription,
} from "../controllers/subscriptionController.js";

import protect from "../middleware/authMiddleware.js";
import  adminOnly from "../middleware/adminMiddleware.js";
const router = express.Router();

// ==========================================
// CREATE NORMAL RAZORPAY PAYMENT ORDER
// ==========================================

router.post(
  "/create",
  protect,
  createSubscription
);

// ==========================================
// VERIFY NORMAL RAZORPAY PAYMENT
// ==========================================

router.post(
  "/verify",
  protect,
  verifySubscription
);

// ==========================================
// GET MY MEMBERSHIP
// ==========================================

router.get(
  "/my",
  protect,
  getMySubscription
);

// ADMIN
router.get(
  "/all",
  protect,
  adminOnly,
  getAllMemberships
);

export default router;