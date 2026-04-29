import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Trackion Docs",
  base: "/docs/",
  description:
    "Trackion documentation for setup, SDK integration, API usage, architecture, and operations.",
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
      { text: "Self Hosting", link: "/self-hosting" },
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
        text: "Integration",
        items: [
          { text: "SDK Usage", link: "/sdk-usage" },
          { text: "JavaScript API", link: "/javascript-api" },
        ],
      },
      {
        text: "API Reference",
        items: [
          { text: "API Reference", link: "/api-reference" },
          { text: "Error Tracking API", link: "/api/errors" },
        ],
      },
      {
        text: "Technical",
        items: [
          { text: "Architecture", link: "/architecture" },
          { text: "Database Schema", link: "/database-schema" },
        ],
      },
      {
        text: "Desktop",
        items: [
          { text: "Desktop Development", link: "/desktop-development" },
          { text: "Desktop Distribution", link: "/desktop-distribution" },
          { text: "Auto-Updater Setup", link: "/updater-setup" },
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
