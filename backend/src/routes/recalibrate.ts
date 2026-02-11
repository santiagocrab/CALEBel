import { Router } from "express";
import { recalibrateMatch } from "../controllers/recalibrateController";

const router = Router();

router.post("/", recalibrateMatch);

export default router;
