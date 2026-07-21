import fs from "node:fs/promises";
import { createReadStream, createWriteStream, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline } from "node:stream/promises";
import { createBrotliDecompress } from "node:zlib";
import chromiumPack from "@sparticuz/chromium";
import { chromium } from "playwright-core";
import { extract as extractTar } from "tar-fs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "review/screenshots");
await fs.mkdir(output, { recursive: true });
const browserCache = path.join(root, "review/.browser");
const browserBin = path.join(root, "node_modules/@sparticuz/chromium/bin");
const executablePath = path.join(browserCache, "chromium");
const fontPath = path.join(browserCache, "fonts");
const libraryPath = path.join(browserCache, "al2023");
await fs.mkdir(browserCache, { recursive: true });

async function inflateFile(input, outputFile) {
  if (existsSync(outputFile)) return;
  await pipeline(createReadStream(input), createBrotliDecompress(), createWriteStream(outputFile, { mode: 0o700 }));
}

async function inflateTar(input, outputDirectory) {
  if (existsSync(outputDirectory)) return;
  await fs.mkdir(outputDirectory, { recursive: true });
  await pipeline(createReadStream(input), createBrotliDecompress(), extractTar(outputDirectory, { chown: false }));
}

await Promise.all([
  inflateFile(path.join(browserBin, "chromium.br"), executablePath),
  inflateTar(path.join(browserBin, "fonts.tar.br"), fontPath),
  inflateTar(path.join(browserBin, "al2023.tar.br"), libraryPath)
]);
process.env.FONTCONFIG_PATH = fontPath;
process.env.LD_LIBRARY_PATH = path.join(libraryPath, "lib");
chromiumPack.setGraphicsMode = false;

const browser = await chromium.launch({
  args: chromiumPack.args,
  executablePath,
  headless: true
});

const errors = [];
async function capture(name, route, viewport, action) {
  const page = await browser.newPage({ viewportSize: viewport, deviceScaleFactor: 1 });
  page.on("pageerror", (error) => errors.push(`${name}: ${error.message}`));
  page.on("console", (message) => { if (message.type() === "error") errors.push(`${name}: ${message.text()}`); });
  const response = await page.goto(`http://127.0.0.1:4321${route}`, { waitUntil: "networkidle" });
  if (!response?.ok()) errors.push(`${name}: HTTP ${response?.status()}`);
  await page.evaluate(() => document.fonts.ready);
  if (action) await action(page);
  await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: false });
  await page.close();
}

await capture("01-login-desktop", "/login/", { width: 1440, height: 900 });
await capture("02-course-desktop", "/course/", { width: 1440, height: 900 });
await capture("03-phase-desktop", "/phase/03/", { width: 1440, height: 900 });
await capture("04-course-progress", "/course/", { width: 1440, height: 900 }, (page) => page.locator(".progress-board").scrollIntoViewIfNeeded());
await capture("05-chapter-01", "/chapter/01/", { width: 1440, height: 900 });
await capture("06-chapter-13", "/chapter/13/", { width: 1440, height: 900 });
await capture("07-chapter-24", "/chapter/24/", { width: 1440, height: 900 });
await capture("08-chapter-drawer", "/chapter/13/", { width: 1440, height: 900 }, (page) => page.locator(".reader-rail [data-sidebar-open]").click());
await capture("09-chapter-evidence", "/chapter/13/", { width: 1440, height: 900 }, (page) => page.locator(".evidence-figure").first().scrollIntoViewIfNeeded());
await capture("10-course-1280", "/course/", { width: 1280, height: 800 });
await capture("11-chapter-1024", "/chapter/13/", { width: 1024, height: 768 });
await capture("12-course-tablet", "/course/", { width: 768, height: 1024 });
await capture("13-course-mobile", "/course/", { width: 390, height: 844 });
await capture("14-chapter-mobile", "/chapter/13/", { width: 390, height: 844 });
await capture("15-chapter-compact", "/chapter/24/", { width: 320, height: 720 });

await browser.close();

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ screenshots: 15, errors: 0 }));
}
