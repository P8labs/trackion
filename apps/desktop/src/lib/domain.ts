const localhostRegex = /^localhost(:\d{1,5})?$/;
const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}(:\d{1,5})?$/;

function normalizeSingleDomain(raw: string): string | null {
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

export function parseDomainsInput(input: string): {
  domains: string[];
  invalidDomains: string[];
} {
  const seen = new Set<string>();
  const domains: string[] = [];
  const invalidDomains: string[] = [];

  const parts = input
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean);

  for (const part of parts) {
    const normalized = normalizeSingleDomain(part);
    if (!normalized) {
      invalidDomains.push(part);
      continue;
    }

    if (!seen.has(normalized)) {
      seen.add(normalized);
      domains.push(normalized);
    }
  }

  return { domains, invalidDomains };
}
