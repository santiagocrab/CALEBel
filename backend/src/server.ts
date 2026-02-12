import app from "./app";
import dotenv from "dotenv";
import { runMigrations } from "./db/migrate";

dotenv.config();

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

// Run migrations on startup (always run in production, optional in dev)
async function initializeDatabase() {
  try {
    console.log("🔄 Starting database migrations...");
    await runMigrations();
    console.log("✅ Database migrations completed successfully");
    return true;
  } catch (err) {
    console.error("❌ Migration failed:", err);
    console.error("Full error:", JSON.stringify(err, null, 2));
    // In production, we should fail if migrations don't work
    if (process.env.NODE_ENV === "production") {
      console.error("⚠️  CRITICAL: Migrations failed in production. Server will not start.");
      throw err;
    } else {
      console.error("⚠️  Server will still start, but database may not be initialized");
      return false;
    }
  }
}

// Always run migrations, but handle errors differently in dev vs production
initializeDatabase()
  .then(() => {
    startServer();
  })
  .catch((err) => {
    console.error("❌ Failed to initialize database. Exiting...");
    process.exit(1);
  });

function startServer() {
  app.listen(port, "0.0.0.0", () => {
    console.log(`CALEBel API listening on http://0.0.0.0:${port}`);
    console.log(`CALEBel API accessible at http://localhost:${port}`);
  });
}
