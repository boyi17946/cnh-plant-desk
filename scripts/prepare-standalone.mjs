import { cpSync, mkdirSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const standalone = path.join(root, ".next", "standalone");

cpSync(path.join(root, ".next", "static"), path.join(standalone, ".next", "static"), {
  recursive: true,
});
cpSync(path.join(root, "public"), path.join(standalone, "public"), {
  recursive: true,
});
mkdirSync(path.join(standalone, ".data"), { recursive: true });
mkdirSync(path.join(standalone, "public", "uploads"), { recursive: true });
