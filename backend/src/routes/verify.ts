import { Router } from "express";
import { requestVerification, confirmVerification } from "../controllers/verifyController";

const router = Router();

router.post("/request", requestVerification);
router.post("/confirm", confirmVerification);

export default router;
