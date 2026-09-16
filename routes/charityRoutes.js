import express from "express";

import {
  createCharity,
  getAllCharities,
  getCharityById,
  updateCharity,
  deleteCharity,
} from "../controllers/charityController.js";

import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllCharities);
router.get("/:id", getCharityById);

// Admin routes
router.post("/", protect, createCharity);
router.put("/:id", protect, adminOnly, updateCharity);
router.delete("/:id", protect, adminOnly, deleteCharity);

export default router;