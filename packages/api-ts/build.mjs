import * as esbuild from "esbuild";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname);

async function build() {
  fs.mkdirSync(path.join(root, "dist"), { recursive: true });

  // Lambda handler bundle (CJS so Lambda Node 20 runs without type:module in zip)
  await esbuild.build({
    entryPoints: [path.join(root, "src/lambda.ts")],
    bundle: true,
    platform: "node",
    target: "node20",
    format: "cjs",
    outfile: path.join(root, "dist/handler.js"),
    external: ["pg-native"],
    sourcemap: true,
    minify: true,
  });

  // Local server bundle (for npm run start)
  await esbuild.build({
    entryPoints: [path.join(root, "src/local.ts")],
    bundle: true,
    platform: "node",
    target: "node20",
    format: "esm",
    outfile: path.join(root, "dist/local.js"),
    sourcemap: true,
  });

  console.log("Build complete: dist/handler.js (Lambda), dist/local.js (local)");
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
