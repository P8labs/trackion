import fs from "fs";
import path from "path";

const root = process.cwd();
const pkgPath = path.join(root, "package.json");
const componentsRoot = path.join(root, "src/components");

const exportsMap = {
  ".": {
    import: "./dist/index.js",
    types: "./dist/index.d.ts",
  },
  "./providers": {
    import: "./dist/providers/index.js",
    types: "./dist/providers/index.d.ts",
  },
  "./lib": {
    import: "./dist/lib/index.js",
    types: "./dist/lib/index.d.ts",
  },
};

const groups = fs.readdirSync(componentsRoot);

for (const group of groups) {
  const groupDir = path.join(componentsRoot, group);
  if (!fs.statSync(groupDir).isDirectory()) continue;

  const files = fs
    .readdirSync(groupDir)
    .filter(
      (f) => (f.endsWith(".ts") || f.endsWith(".tsx")) && f !== "index.ts",
    )
    .map((f) => f.replace(/\.(ts|tsx)$/, ""));

  for (const name of files) {
    exportsMap[`./${name}`] = {
      import: `./dist/${group}/${name}.js`,
      types: `./dist/${group}/${name}.d.ts`,
    };
  }
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
pkg.exports = exportsMap;

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

console.log("✅ exports generated (group-aware)");
