import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  build: {
    assets: "assets",
    inlineStylesheets: "auto"
  },
  vite: {
    build: {
      cssCodeSplit: true
    }
  }
});
