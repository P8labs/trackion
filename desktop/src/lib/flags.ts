export const flags = {
  mode: import.meta.env.VITE_TRACKION_MODE || "saas",
  isSaaS: (import.meta.env.VITE_TRACKION_MODE || "saas") === "saas",
  enableGithubLogin: import.meta.env.VITE_ENABLE_GITHUB_LOGIN === "true",
  enableGoogleLogin: import.meta.env.VITE_ENABLE_GOOGLE_LOGIN === "true",
  trackionUrl: import.meta.env.VITE_TRACKION_URL || "https://api.trackion.tech",
  trackionToken:
    import.meta.env.VITE_TRACKION_TOKEN ||
    "8673e3bb-026f-5f43-891f-16363b28d465",
};
