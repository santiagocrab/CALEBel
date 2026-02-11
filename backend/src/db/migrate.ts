import fs from "fs";
import path from "path";
import { query } from "./index";

async function runMigrations() {
  const migrationsDir = path.join(__dirname, "migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
    // Each migration is idempotent by design (IF NOT EXISTS)
    await query(sql);
  }
}

runMigrations()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log("Migrations complete.");
    process.exit(0);
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Migration failed:", err);
    process.exit(1);
  });
