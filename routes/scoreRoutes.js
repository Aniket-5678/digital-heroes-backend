import express from "express";

import {
  addScore,
  getMyScores,
  updateScore,
  deleteScore,
} from "../controllers/scoreController.js";

import protect from "../middleware/authMiddleware.js";
import { getAllWinners } from "../controllers/winnerController.js";

const router = express.Router();

router.post("/", protect, addScore);

router.get("/", protect, getMyScores);
router.get(
  "/all",
  protect,
  getAllWinners
);

router.put("/:id", protect, updateScore);

router.delete("/:id", protect, deleteScore);

export default router;