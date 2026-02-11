import { Router } from "express";
import {
  getAllUsers,
  verifyPayment,
  getAllMatches,
  calculateCompatibility,
  createMatch,
  getStats,
  getCompatibilitySuggestions
} from "../controllers/adminController";

const router = Router();

// Admin routes (in production, add authentication middleware here)
router.get("/users", getAllUsers);
router.get("/matches", getAllMatches);
router.get("/stats", getStats);
router.get("/compatibility-suggestions/:userId", getCompatibilitySuggestions);
router.post("/verify-payment", verifyPayment);
router.post("/calculate-compatibility", calculateCompatibility);
router.post("/create-match", createMatch);

export default router;
