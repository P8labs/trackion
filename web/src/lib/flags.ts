export const flags = {
  mode: import.meta.env.VITE_TRACKION_MODE || "saas",
  isSaaS: (import.meta.env.VITE_TRACKION_MODE || "saas") === "saas",
  enableGithubLogin: import.meta.env.VITE_ENABLE_GITHUB_LOGIN === "true",
  enableGoogleLogin: import.meta.env.VITE_ENABLE_GOOGLE_LOGIN === "true",
};
