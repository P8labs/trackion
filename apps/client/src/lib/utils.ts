export function formatTimeSpent(seconds: number) {
  if (seconds === 0) return "0s";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  if (minutes > 0) {
    return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
  }
  return `${secs}s`;
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const localhostRegex = /^localhost(:\d{1,5})?$/;
const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}(:\d{1,5})?$/;

export function normalizeSingleDomain(raw: string): string | null {
  const value = raw.trim().toLowerCase();
  if (!value) {
    return null;
  }

  const withScheme = value.includes("://") ? value : `http://${value}`;

  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return null;
  }

  if (!url.host) {
    return null;
  }

  const host = url.host.replace(/\.$/, "");
  if (!isValidHost(host)) {
    return null;
  }

  return host;
}

function isValidHost(host: string): boolean {
  if (localhostRegex.test(host) || ipv4Regex.test(host)) {
    return true;
  }

  const [hostname, port] = host.split(":");

  if (port) {
    const portNum = Number(port);
    if (!Number.isInteger(portNum) || portNum < 1 || portNum > 65535) {
      return false;
    }
  }

  const labels = hostname.split(".");
  if (labels.length < 2) {
    return false;
  }

  return labels.every((label) => {
    if (!label || label.startsWith("-") || label.endsWith("-")) {
      return false;
    }
    return /^[a-z0-9-]+$/.test(label);
  });
}
