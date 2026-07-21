import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDirectory = path.join(root, "dist");
const clientDirectory = path.join(distDirectory, "client");
const serverDirectory = path.join(root, "dist/server");

// ChatGPT Sites follows the Cloudflare Vite output convention: browser assets
// live in dist/client while the Worker entry lives in dist/server. Astro emits
// its static site at the dist root, so relocate that output before packaging.
await fs.mkdir(clientDirectory, { recursive: true });
const distEntries = await fs.readdir(distDirectory, { withFileTypes: true });
for (const entry of distEntries) {
  if (entry.name === "client" || entry.name === "server") continue;
  await fs.rename(
    path.join(distDirectory, entry.name),
    path.join(clientDirectory, entry.name)
  );
}

await fs.mkdir(serverDirectory, { recursive: true });

const worker = `const worker = {
  async fetch(request, env) {
    const assetUrl = new URL(request.url);
    if (assetUrl.pathname.endsWith("/")) {
      assetUrl.pathname += "index.html";
    } else if (!assetUrl.pathname.split("/").pop().includes(".")) {
      assetUrl.pathname += "/index.html";
    }
    const assetRequest = new Request(assetUrl, request);
    const response = await env.ASSETS.fetch(assetRequest);
    if (response.status !== 404) return response;
    return new Response("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" }
    });
  }
};

export default worker;
`;

await fs.writeFile(path.join(serverDirectory, "index.js"), worker);
