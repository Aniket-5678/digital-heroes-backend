import express from "express";

import { createManualWinner, createWinners, getAllWinners, markWinnerAsPaid, submitWinnerProof, verifyWinner } from "../controllers/winnerController.js";

import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post(
  "/draw/:drawId/create",
  protect,
  adminOnly,
  createWinners
);
router.post(
  "/manual",
  protect,
  adminOnly,
  createManualWinner
);

// User submits proof
router.post(
  "/:id/proof",
  protect,
  submitWinnerProof
);
router.get(
  "/all",
  protect,
  getAllWinners
);
// Admin approves/rejects
router.patch(
  "/:id/verify",
  protect,
  adminOnly,
  verifyWinner
);

// Admin marks payment as paid
router.patch(
  "/:id/pay",
  protect,
  adminOnly,
  markWinnerAsPaid
);

export default router;