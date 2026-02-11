import app from "./app";
import dotenv from "dotenv";
import { runMigrations } from "./db/migrate";

dotenv.config();

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

// Run migrations on startup (only in production)
if (process.env.NODE_ENV === "production") {
  runMigrations()
    .then(() => {
      console.log("✅ Database migrations completed successfully");
      startServer();
    })
    .catch((err) => {
      console.error("❌ Migration failed:", err);
      console.error("⚠️  Server will still start, but database may not be initialized");
      startServer();
    });
} else {
  startServer();
}

function startServer() {
  app.listen(port, "0.0.0.0", () => {
    console.log(`CALEBel API listening on http://0.0.0.0:${port}`);
    console.log(`CALEBel API accessible at http://localhost:${port}`);
  });
}
