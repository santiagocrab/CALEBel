import { Router } from "express";
import {
  requestRematch,
  verifyRematchPayment,
  getRematchStatus
} from "../controllers/rematchController";

const router = Router();

router.post("/request", requestRematch);
router.post("/verify-payment", verifyRematchPayment);
router.get("/status/:userId", getRematchStatus);

export default router;
