import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/**
 * Run a package-local binary with cwd = that package (Windows-safe).
 * Usage: node scripts/run-in-package.mjs <packageDir> <eslint|prettier> [...args]
 */
const [packageDir, tool, ...args] = process.argv.slice(2);

if (!packageDir || !tool) {
  console.error(
    "Usage: node scripts/run-in-package.mjs <packageDir> <eslint|prettier> [...args]",
  );
  process.exit(1);
}

const cwd = path.resolve(process.cwd(), packageDir);
const pkgJsonPath = path.join(cwd, "node_modules", tool, "package.json");

if (!fs.existsSync(pkgJsonPath)) {
  console.error(`Cannot find ${tool} in ${packageDir}/node_modules`);
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
const binField = pkg.bin;
const binRelative =
  typeof binField === "string" ? binField : binField?.[tool];

if (!binRelative) {
  console.error(`No bin entry for ${tool}`);
  process.exit(1);
}

const bin = path.join(cwd, "node_modules", tool, binRelative);
const result = spawnSync(process.execPath, [bin, ...args], {
  cwd,
  stdio: "inherit",
});

process.exit(result.status ?? 1);
