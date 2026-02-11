import { Router } from "express";
import { runMatching, getMatchForUser } from "../controllers/matchController";
import { consentChat, consentReveal } from "../controllers/consentController";

const router = Router();

router.post("/", runMatching);
router.get("/:userId", getMatchForUser);
router.post("/consent/chat", consentChat);
router.post("/consent/reveal", consentReveal);

export default router;
