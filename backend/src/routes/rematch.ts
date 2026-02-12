import { Router } from "express";
import {
  requestRematch,
  verifyRematchPayment,
  getRematchStatus,
  updateBlueprint,
  getAllRematchRequests
} from "../controllers/rematchController";

const router = Router();

router.post("/request", requestRematch);
router.post("/verify-payment", verifyRematchPayment);
router.get("/status/:userId", getRematchStatus);
router.post("/update-blueprint", updateBlueprint);
router.get("/requests", getAllRematchRequests); // Admin endpoint

export default router;
