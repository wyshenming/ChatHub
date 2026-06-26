const fs = require("fs");
const path = require("path");
const { rcedit } = require("rcedit");

const root = path.join(__dirname, "..");
const unpackedTarget = path.join(root, "dist", "win-unpacked", "ChatHub.exe");
const portableTarget = path.join(root, "dist", "ChatHub.exe");
const iconPath = path.join(root, "build", "icon.ico");
const targets = process.argv.includes("--unpacked-only")
  ? [unpackedTarget]
  : [portableTarget, unpackedTarget];

const version = require(path.join(root, "package.json")).version;
const author = "染泓如梦QAQ";

async function updateTarget(target) {
  if (!fs.existsSync(target)) {
    return;
  }

  await rcedit(target, {
    icon: iconPath,
    "file-version": version,
    "product-version": version,
    "version-string": {
      CompanyName: author,
      FileDescription: "ChatHub",
      InternalName: "ChatHub",
      OriginalFilename: "ChatHub.exe",
      ProductName: "ChatHub",
      Author: author,
      Authors: author,
      LegalCopyright: `Copyright (c) 2026 ${author}`
    }
  });
}

Promise.all(targets.map(updateTarget)).catch((error) => {
  console.error(error);
  process.exit(1);
});
