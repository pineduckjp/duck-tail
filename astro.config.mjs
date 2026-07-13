// @ts-check

import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

import favicons from "astro-favicons";

// https://astro.build/config
export default defineConfig({
  site: "https://duck-tail.pineduck.jp/",
  devToolbar: {
    enabled: false,
  },
  markdown: {
    syntaxHighlight: {
      type: "shiki",
      excludeLangs: ["math"],
    },
    shikiConfig: {
      theme: "github-light",
    },
  },
  integrations: [
    sitemap(),
    favicons({
      name: "アヒルのしっぽ",
      short_name: "しっぽ",
      background: "rgb(229 228 227)",
      themes: ["rgb(229 228 227)"],
      manifest: {
        description: "不定期で更新しているPineDuckのブログです。",
        id: "/",
        start_url: "/",
        scope: "/",
        display: "standalone",
        display_override: ["standalone", "browser"],
      },
    }),
  ],
});
