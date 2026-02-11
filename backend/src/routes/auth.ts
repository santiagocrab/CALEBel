import { Router } from "express";
import { requestSignIn, verifySignIn } from "../controllers/authController";

const router = Router();

router.post("/signin/request", requestSignIn);
router.post("/signin/verify", verifySignIn);

export default router;
