/**
 * Relativise / absolute paths pour ESLint depuis le package `back`.
 */
export default {
  "back/src/**/*.{ts,js}": (filenames) => {
    if (filenames.length === 0) return [];
    const quoted = filenames.map((file) => `"${file.replace(/"/g, '\\"')}"`);
    return [`npm --prefix back exec -- eslint --fix ${quoted.join(" ")}`];
  },
};
