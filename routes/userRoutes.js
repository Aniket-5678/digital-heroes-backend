import express from "express";
import { getAllUsers, getMyProfile, updateMyCharity } from "../controllers/userController.js";
import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";
const router = express.Router();

router.get("/profile", protect, getMyProfile);
router.put("/charity", protect, updateMyCharity);
router.get(
  "/all",
  protect,
  adminOnly,
  getAllUsers
);
export default router;