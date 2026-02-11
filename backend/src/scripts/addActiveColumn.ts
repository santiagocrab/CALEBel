import { query } from "../db";

async function addActiveColumn() {
  try {
    console.log("Adding 'active' column to matches table...");
    await query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'matches' AND column_name = 'active'
        ) THEN
          ALTER TABLE matches ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE;
          RAISE NOTICE 'Column active added successfully';
        ELSE
          RAISE NOTICE 'Column active already exists';
        END IF;
      END $$;
    `);
    console.log("✅ Column check/creation completed");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

addActiveColumn();
