type Flags = {
  mode: string;
  isSaaS: boolean;
  trackionUrl: string;
  trackionToken: string;

  device: "web" | "mobile" | "desktop";
  devMode: boolean;
};

export const SERVER_URL =
  import.meta.env.VITE_SERVER_URL || "http://localhost:8000";
export const WEB_VERSION = import.meta.env.VITE_WEB_VERSION || "0.0.0";

export const flags: Flags = {
  mode: import.meta.env.VITE_TRACKION_MODE || "saas",
  isSaaS: (import.meta.env.VITE_TRACKION_MODE || "saas") === "saas",
  trackionUrl: import.meta.env.VITE_TRACKION_URL || "https://api.trackion.tech",
  trackionToken:
    import.meta.env.VITE_TRACKION_TOKEN ||
    "8673e3bb-026f-5f43-891f-16363b28d465",

  device: import.meta.env.VITE_DEVICE || "web",
  devMode: import.meta.env.DEV,
};

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
