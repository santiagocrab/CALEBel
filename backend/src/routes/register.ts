import { Router } from "express";
import { registerUser } from "../controllers/registerController";

const router = Router();

router.post("/", registerUser);

export default router;
