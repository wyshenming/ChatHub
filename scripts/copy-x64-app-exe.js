const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const source = path.join(root, "dist", "win-unpacked");
const target = path.join(root, "dist");

if (!fs.existsSync(source)) {
  throw new Error(`Missing x64 app runtime: ${source}`);
}

for (const entry of fs.readdirSync(source)) {
  fs.cpSync(path.join(source, entry), path.join(target, entry), {
    recursive: true,
    force: true,
  });
}
