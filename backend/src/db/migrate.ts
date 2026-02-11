import fs from "fs";
import path from "path";
import { query } from "./index";

export async function runMigrations() {
  const migrationsDir = path.join(__dirname, "migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  console.log(`🔄 Running ${files.length} migration(s)...`);
  
  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
    // Each migration is idempotent by design (IF NOT EXISTS)
    await query(sql);
    console.log(`✅ Migration ${file} completed`);
  }
  
  console.log("✅ All migrations completed successfully");
}

// Only run migrations directly if this file is executed (for local development)
if (require.main === module) {
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
}
