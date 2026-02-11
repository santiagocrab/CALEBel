import { Router } from "express";
import { createTestAccounts, checkTestAccounts, sendMessageAsPartner, matchUsersByEmail } from "../controllers/testController";

const router = Router();

if (process.env.NODE_ENV !== "production") {
  router.get("/check-accounts", checkTestAccounts);
  router.post("/create-accounts", createTestAccounts);
  router.post("/send-message-as-partner", sendMessageAsPartner);
  router.post("/match-users", matchUsersByEmail);
}

export default router;
