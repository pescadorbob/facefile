/**
 * Patches Playwright's ESM loader for Node.js 22 compatibility.
 *
 * In Node 22, context.conditions is a Set (not an Array), so .includes()
 * doesn't exist on it. This replaces all occurrences with a guard that
 * handles both Array (Node <22) and Set (Node 22+).
 */
const fs = require('fs');
const path = require('path');

const OLD = `context.conditions?.includes("import")`;
const NEW = `(Array.isArray(context.conditions) ? context.conditions.includes("import") : context.conditions?.has?.("import") ?? false)`;

const targets = [
  path.join(__dirname, '..', 'node_modules', 'playwright', 'lib', 'transform', 'esmLoader.js'),
  path.join(__dirname, '..', 'node_modules', 'playwright', 'lib', 'common', 'index.js'),
];

for (const file of targets) {
  if (!fs.existsSync(file)) continue;
  const original = fs.readFileSync(file, 'utf8');
  if (!original.includes(OLD)) continue;
  fs.writeFileSync(file, original.replaceAll(OLD, NEW), 'utf8');
  console.log(`Patched: ${path.relative(process.cwd(), file)}`);
}
