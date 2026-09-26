import path from "node:path";

/**
 * Relativize absolute paths and run tools with cwd = package dir
 * via scripts/run-in-package.mjs (Windows-safe: no shell `cd &&`).
 */
function packageLintCommands(packageDir, filenames) {
  if (filenames.length === 0) return [];

  const packageRoot = path.resolve(packageDir);
  const relative = filenames.map((file) =>
    path.relative(packageRoot, file).split(path.sep).join("/"),
  );
  const quoted = relative.map((file) => `"${file.replace(/"/g, '\\"')}"`);
  const list = quoted.join(" ");

  return [
    `node scripts/run-in-package.mjs ${packageDir} eslint --fix ${list}`,
    `node scripts/run-in-package.mjs ${packageDir} prettier --write ${list}`,
  ];
}

export default {
  "back/src/**/*.{ts,js}": (filenames) =>
    packageLintCommands("back", filenames),
  "front-mobile/**/*.{ts,tsx,js,jsx}": (filenames) =>
    packageLintCommands("front-mobile", filenames),
};
