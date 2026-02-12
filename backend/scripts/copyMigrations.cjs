const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const srcDir = path.join(rootDir, "src", "db", "migrations");
const destDir = path.join(rootDir, "dist", "db", "migrations");

if (!fs.existsSync(srcDir)) {
  console.error(`Migration source directory not found: ${srcDir}`);
  process.exit(1);
}

fs.mkdirSync(destDir, { recursive: true });

for (const file of fs.readdirSync(srcDir)) {
  if (!file.endsWith(".sql")) continue;
  fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
}

console.log(`Copied migrations from ${srcDir} to ${destDir}`);
