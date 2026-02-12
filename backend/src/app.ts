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

// CORS configuration
const corsOriginsEnv = process.env.CORS_ORIGINS || "";
const corsOrigins = corsOriginsEnv 
  ? corsOriginsEnv.split(",").map(origin => origin.trim()).filter(origin => origin.length > 0)
  : [];

// Debug logging
console.log("🌐 CORS Configuration:");
console.log("  - CORS_ORIGINS env var:", corsOriginsEnv || "(not set)");
console.log("  - Parsed origins:", corsOrigins.length > 0 ? corsOrigins : ["* (allowing all)"]);

// If no CORS_ORIGINS is set, allow all origins (for development/debugging)
const allowAllOrigins = corsOrigins.length === 0;

// CORS middleware configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log("✅ CORS: Allowing request with no origin");
      return callback(null, true);
    }
    
    // If no CORS_ORIGINS is set, allow all origins
    if (allowAllOrigins) {
      console.log(`✅ CORS: Allowing origin (no restrictions): ${origin}`);
      return callback(null, true);
    }
    
    // If CORS_ORIGINS is set to "*", allow all origins
    if (corsOrigins.includes("*")) {
      console.log(`✅ CORS: Allowing origin (wildcard): ${origin}`);
      return callback(null, true);
    }
    
    // Check if the origin is in the allowed list (exact match)
    if (corsOrigins.includes(origin)) {
      console.log(`✅ CORS: Allowing origin (in list): ${origin}`);
      return callback(null, true);
    }
    
    // Also check without protocol (just in case)
    const originWithoutProtocol = origin.replace(/^https?:\/\//, "");
    const originsWithoutProtocol = corsOrigins.map(o => o.replace(/^https?:\/\//, ""));
    if (originsWithoutProtocol.includes(originWithoutProtocol)) {
      console.log(`✅ CORS: Allowing origin (without protocol match): ${origin}`);
      return callback(null, true);
    }
    
    // Reject the request
    console.warn(`⚠️  CORS blocked origin: ${origin}`);
    console.warn(`   Allowed origins:`, corsOrigins);
    callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  exposedHeaders: ["Content-Type", "Authorization"],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Explicit OPTIONS handler for all routes (backup)
app.options("*", cors(corsOptions));
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
  res.json({ 
    status: "ok",
    cors: {
      configured: corsOrigins.length > 0,
      origins: corsOrigins.length > 0 ? corsOrigins : ["* (allowing all)"],
      allowAll: allowAllOrigins
    }
  });
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

// Server startup is handled in server.ts for production builds
if (require.main === module) {
  const port = process.env.PORT ? Number(process.env.PORT) : 4000;
  app.listen(port, "0.0.0.0", () => {
    // eslint-disable-next-line no-console
    console.log(`CALEBel API listening on http://0.0.0.0:${port}`);
    console.log(`CALEBel API accessible at http://localhost:${port}`);
  });
}

export default app;
