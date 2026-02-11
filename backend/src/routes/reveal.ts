import { Router } from "express";
import { getReveal } from "../controllers/revealController";

const router = Router();

router.get("/:matchId", getReveal);

export default router;
