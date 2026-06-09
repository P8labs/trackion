export const flags = {
  mode: import.meta.env.VITE_TRACKION_MODE || "saas",
  isSaaS: (import.meta.env.VITE_TRACKION_MODE || "saas") === "saas",
  enableGithubLogin: import.meta.env.VITE_ENABLE_GITHUB_LOGIN === "true",
  enableGoogleLogin: import.meta.env.VITE_ENABLE_GOOGLE_LOGIN === "true",
  trackionUrl: import.meta.env.VITE_TRACKION_URL || "https://api.trackion.tech",
  trackionToken:
    import.meta.env.VITE_TRACKION_TOKEN ||
    "8673e3bb-026f-5f43-891f-16363b28d465",

  device: import.meta.env.VITE_DEVICE || "web",
  devMode: import.meta.env.DEV,
};

export type Flags = typeof flags;

export function IsWeb(test?: boolean): boolean {
  if (flags.devMode && test) {
    return true;
  }
  return flags.device === "web";
}

export function IsMobile(test?: boolean): boolean {
  if (flags.devMode && test) {
    return true;
  }
  return flags.device === "mobile";
}

export function IsDesktop(test?: boolean): boolean {
  if (flags.devMode && test) {
    return true;
  }
  return flags.device === "desktop";
}
