import express from "express";

import {
  createDraw,
  getAllDraws,
  getDrawById,
  publishDraw,
  completeDraw,
  calculatePrizePool,
  getCurrentDraw,
 
} from "../controllers/drawController.js";

import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/create", protect, adminOnly, createDraw);
router.post(
  "/:id/prize-pool",
  protect,
  adminOnly,
  calculatePrizePool
);
router.get("/", protect,  getAllDraws);

router.get("/:id", protect, adminOnly, getDrawById);

router.patch("/:id/publish", protect, adminOnly, publishDraw);

router.patch("/:id/complete", protect, adminOnly, completeDraw);
router.get("/:drawId/my-entry", protect, getCurrentDraw);
export default router;