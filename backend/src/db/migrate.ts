import fs from "fs";
import path from "path";
import { query } from "./index";

export async function runMigrations() {
  // In production we execute from dist/, but SQL files live in src/db/migrations.
  // Try dist path first, then fall back to src path.
  const candidateDirs = [
    path.join(__dirname, "migrations"),
    path.join(process.cwd(), "src", "db", "migrations"),
  ];

  const migrationsDir = candidateDirs.find((dir) => fs.existsSync(dir));
  if (!migrationsDir) {
    throw new Error(
      `Migrations directory not found. Checked: ${candidateDirs.join(", ")}`
    );
  }
  
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.warn("⚠️  No migration files found!");
    return;
  }

  console.log(`🔄 Running ${files.length} migration(s)...`);
  
  for (const file of files) {
    try {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf-8");
      
      if (!sql || sql.trim().length === 0) {
        console.warn(`⚠️  Migration ${file} is empty, skipping...`);
        continue;
      }
      
      // Each migration is idempotent by design (IF NOT EXISTS)
      await query(sql);
      console.log(`✅ Migration ${file} completed`);
    } catch (err) {
      console.error(`❌ Migration ${file} failed:`, err);
      throw err;
    }
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
