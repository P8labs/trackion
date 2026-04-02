import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Trackion Docs",
  base: "/docs/",
  description:
    "Trackion documentation for setup, API usage, architecture, and self-hosting.",
  lang: "en-US",
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: [/^https?:\/\/localhost/, /^http:\/\/127\.0\.0\.1/],
  head: [
    ["link", { rel: "icon", type: "image/png", href: "/docs/trackion.png" }],
  ],
  themeConfig: {
    siteTitle: "Trackion Docs",
    nav: [
      { text: "Introduction", link: "/introduction" },
      { text: "Quick Start", link: "/quick-start" },
      { text: "SDK Usage", link: "/sdk-usage" },
      { text: "API Reference", link: "/api-reference" },
      { text: "Architecture", link: "/architecture" },
    ],
    sidebar: [
      {
        text: "Getting Started",
        items: [
          { text: "Home", link: "/" },
          { text: "Introduction", link: "/introduction" },
          { text: "SaaS Guide", link: "/saas-guide" },
          { text: "Quick Start", link: "/quick-start" },
          { text: "Self Hosting", link: "/self-hosting" },
        ],
      },
      {
        text: "Reference",
        items: [
          { text: "API Reference", link: "/api-reference" },
          { text: "SDK Usage", link: "/sdk-usage" },
          { text: "JavaScript API", link: "/javascript-api" },
          { text: "Architecture", link: "/architecture" },
          { text: "Database Schema", link: "/database-schema" },
        ],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/P8labs/trackion" },
    ],
    search: {
      provider: "local",
    },
    footer: {
      message: "Built with love by P8Labs",
      copyright: "Released under the MIT License",
    },
  },
});
