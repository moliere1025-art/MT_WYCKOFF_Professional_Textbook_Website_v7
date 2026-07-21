import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const course = JSON.parse(await fs.readFile(path.join(root, "src/data/course.json"), "utf8"));
const searchIndex = JSON.parse(await fs.readFile(path.join(root, "public/search-index.json"), "utf8"));
const dist = path.join(root, "dist/client");

async function htmlFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => entry.isDirectory() ? htmlFiles(path.join(directory, entry.name)) : entry.name.endsWith(".html") ? [path.join(directory, entry.name)] : []));
  return files.flat();
}

function textContent(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(?:39|x27);/g, "'")
    .replace(/\s+/g, "");
}

function normalized(value = "") {
  return value.replace(/\s+/g, "");
}

const counts = { paragraph: 0, heading: 0, list: 0, image: 0, table: 0, caption: 0 };
for (const chapter of course.chapters) {
  for (const block of chapter.blocks) {
    if (block.type in counts) counts[block.type] += 1;
  }
  const file = path.join(dist, "chapter", chapter.slug, "index.html");
  await fs.access(file);
  const html = await fs.readFile(file, "utf8");
  if (!html.includes(chapter.title)) throw new Error(`Chapter title missing from ${file}`);
  const visibleText = textContent(html);
  for (const [index, block] of chapter.blocks.entries()) {
    const values = [];
    if (block.text) values.push(block.text.replace(/^\d+\.\d+\s*/, ""));
    if (block.items) values.push(...block.items);
    if (block.rows) values.push(...block.rows.flat());
    if (block.caption) values.push(block.caption);
    for (const value of values) {
      if (value && !visibleText.includes(normalized(value))) {
        throw new Error(`Chapter ${chapter.number}, block ${index} text missing: ${value.slice(0, 50)}`);
      }
    }
    if (block.type === "image") {
      const assetPath = path.join(dist, block.src.replace(/^\//, ""));
      await fs.access(assetPath);
    }
  }
  const chapterSearch = searchIndex.filter((record) => record.chapter === chapter.number);
  for (const record of chapterSearch) {
    const escapedAnchor = record.anchor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (!new RegExp(`id=["']${escapedAnchor}["']`).test(html)) {
      throw new Error(`Search anchor missing in chapter ${chapter.number}: ${record.anchor}`);
    }
  }
}

for (const phase of course.phases) {
  await fs.access(path.join(dist, "phase", phase.slug, "index.html"));
}

await fs.access(path.join(dist, "login", "index.html"));
await fs.access(path.join(dist, "course", "index.html"));

const generatedHtml = await htmlFiles(dist);
for (const file of generatedHtml) {
  const html = await fs.readFile(file, "utf8");
  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/g)].map((match) => match[1]);
  if (new Set(ids).size !== ids.length) throw new Error(`Duplicate id in ${file}`);
  if ((html.match(/<h1(?:\s|>)/g) || []).length !== 1) throw new Error(`Expected exactly one h1 in ${file}`);
  if (/<form[^>]*method=["']get["'][^>]*>[\s\S]*?type=["']password["']/i.test(html)) throw new Error(`Password form uses GET in ${file}`);

  for (const match of html.matchAll(/\shref=["'](\/[^"'#?]*)(?:#([^"']+))?[^"']*["']/g)) {
    const route = match[1];
    const anchor = match[2];
    const target = route.endsWith("/") ? path.join(dist, route, "index.html") : path.join(dist, route);
    await fs.access(target);
    if (anchor) {
      const targetHtml = target === file ? html : await fs.readFile(target, "utf8");
      if (!targetHtml.includes(`id="${anchor}"`) && !targetHtml.includes(`id='${anchor}'`)) throw new Error(`Broken anchor ${route}#${anchor} in ${file}`);
    }
  }
}

const courseHtml = textContent(await fs.readFile(path.join(dist, "course", "index.html"), "utf8"));
for (const index of [5, 9, 11, 12, 13, 15, 17, 20]) {
  const value = course.frontMatter[index]?.text;
  if (value && !courseHtml.includes(normalized(value))) throw new Error(`Course guide text missing: frontMatter[${index}]`);
}
for (const phase of course.phases) {
  if (!courseHtml.includes(normalized(phase.title))) throw new Error(`Course phase missing: ${phase.title}`);
}

const result = {
  routes: 3 + course.phases.length + course.chapters.length,
  chapters: course.chapters.length,
  htmlIntegrity: { duplicateIds: 0, brokenLinks: 0, brokenAnchors: 0, unsafePasswordForms: 0 },
  blocks: counts
};

console.log(JSON.stringify(result, null, 2));
