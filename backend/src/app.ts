import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import registerRoutes from "./routes/register";
import matchRoutes from "./routes/match";
import chatRoutes from "./routes/chat";
import uploadRoutes from "./routes/upload";
import verifyRoutes from "./routes/verify";
import recalibrateRoutes from "./routes/recalibrate";
import revealRoutes from "./routes/reveal";
import authRoutes from "./routes/auth";
import testRoutes from "./routes/test";
import adminRoutes from "./routes/admin";
import rematchRoutes from "./routes/rematch";
import path from "path";

dotenv.config();

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(
  cors({
    origin: process.env.CORS_ORIGINS?.split(",") ?? "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

app.get("/", (_req, res) => {
  res.json({ 
    message: "CALEBel API Server",
    status: "running",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      register: "/api/register",
      match: "/api/match",
      chat: "/api/chat",
      upload: "/api/upload",
      verify: "/api/verify",
      recalibrate: "/api/recalibrate",
      reveal: "/api/reveal",
      auth: "/api/auth"
    }
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/register", registerRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/verify", verifyRoutes);
app.use("/api/recalibrate", recalibrateRoutes);
app.use("/api/reveal", revealRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/rematch", rematchRoutes);

app.listen(port, "0.0.0.0", () => {
  // eslint-disable-next-line no-console
  console.log(`CALEBel API listening on http://0.0.0.0:${port}`);
  console.log(`CALEBel API accessible at http://localhost:${port}`);
});
