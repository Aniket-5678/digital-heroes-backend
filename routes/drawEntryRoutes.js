import express from "express";

import { participateInDraw } from "../controllers/drawEntryController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/participate", protect, participateInDraw);

export default router;