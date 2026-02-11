import { Router } from "express";
import { sendMessage, getMessages } from "../controllers/chatController";

const router = Router();

router.post("/send", sendMessage);
router.get("/:matchId", getMessages);

export default router;
