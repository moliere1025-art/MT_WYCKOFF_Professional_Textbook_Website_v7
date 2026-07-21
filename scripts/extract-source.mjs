import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.resolve(projectRoot, "../upload/Wyckoff_Professional_Textbook_v5.1_Standalone.html");

const source = await fs.readFile(sourcePath, "utf8");

function readJsonScript(id) {
  const expression = new RegExp(`<script[^>]*id=["']${id}["'][^>]*>([\\s\\S]*?)<\\/script>`);
  const match = source.match(expression);
  if (!match) throw new Error(`Missing embedded JSON script: ${id}`);
  return JSON.parse(match[1]);
}

const course = readJsonScript("course-data");
const search = readJsonScript("search-data");
const assets = readJsonScript("asset-data");

if (course.chapters?.length !== 24) {
  throw new Error(`Expected 24 chapters, found ${course.chapters?.length ?? 0}`);
}

await fs.mkdir(path.join(projectRoot, "src/data"), { recursive: true });
await fs.mkdir(path.join(projectRoot, "public/course-assets/figures"), { recursive: true });

await fs.writeFile(path.join(projectRoot, "src/data/course.json"), `${JSON.stringify(course, null, 2)}\n`);
await fs.writeFile(path.join(projectRoot, "public/search-index.json"), `${JSON.stringify(search)}\n`);

let writtenAssets = 0;
for (const [filename, dataUrl] of Object.entries(assets)) {
  const match = /^data:([^;,]+);base64,(.+)$/s.exec(dataUrl);
  if (!match) continue;
  const outputName = filename === "cover.webp" ? filename : path.basename(filename);
  const destination = path.join(projectRoot, "public/course-assets/figures", outputName);
  await fs.writeFile(destination, Buffer.from(match[2], "base64"));
  writtenAssets += 1;
}

const summary = {
  title: course.meta.title,
  phases: course.phases.length,
  chapters: course.chapters.length,
  searchRecords: search.length,
  assets: writtenAssets
};

await fs.writeFile(path.join(projectRoot, "src/data/extraction-summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary));
