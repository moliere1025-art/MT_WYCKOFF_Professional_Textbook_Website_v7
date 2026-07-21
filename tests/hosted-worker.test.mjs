import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import worker from "../dist/server/index.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const clientDirectory = path.join(root, "dist/client");

const env = {
  ASSETS: {
    async fetch(request) {
      const pathname = decodeURIComponent(new URL(request.url).pathname).replace(/^\/+/, "");
      const file = path.join(clientDirectory, pathname);
      try {
        const body = await fs.readFile(file);
        return new Response(body, { status: 200 });
      } catch {
        return new Response("Not found", { status: 404 });
      }
    }
  }
};

for (const route of ["/", "/course/", "/phase/03", "/chapter/13/"]) {
  test(`serves ${route}`, async () => {
    const response = await worker.fetch(new Request(`https://example.test${route}`), env);
    assert.equal(response.status, 200);
    assert.match(await response.text(), /<!DOCTYPE html>/i);
  });
}

test("serves versioned browser assets", async () => {
  const files = await fs.readdir(path.join(clientDirectory, "assets"));
  const asset = files.find((name) => name.endsWith(".css"));
  assert.ok(asset);
  const response = await worker.fetch(new Request(`https://example.test/assets/${asset}`), env);
  assert.equal(response.status, 200);
  assert.ok((await response.arrayBuffer()).byteLength > 0);
});

test("preserves a real 404", async () => {
  const response = await worker.fetch(new Request("https://example.test/missing/"), env);
  assert.equal(response.status, 404);
});
