/**
 * Error tracking utilities for Trackion SDK
 * Handles error normalization, fingerprint generation, and capture
 */

import type { TrackionJSON } from "./core";

export interface ErrorContext {
  [key: string]: TrackionJSON;
}

export interface NormalizedError {
  message: string;
  stack: string;
  name: string;
  lineno?: number;
  colno?: number;
  filename?: string;
}

/**
 * Generate a deterministic fingerprint for error grouping
 * Uses SHA-256 of (message + first line of stack trace)
 */
export async function generateFingerprint(
  message: string,
  stackTrace: string,
): Promise<string> {
  const normalizedMessage = message.trim();

  // Extract first meaningful line from stack trace
  let firstLine = "";
  if (stackTrace) {
    const lines = stackTrace.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      // Skip empty lines and the error message line itself
      if (trimmed && trimmed !== normalizedMessage) {
        firstLine = trimmed;
        break;
      }
    }
  }

  const input = normalizedMessage + firstLine;

  // Use Web Crypto API for SHA-256 (available in modern browsers)
  if (typeof crypto !== "undefined" && crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch (e) {
      // Fallback to simple hash if crypto.subtle fails
      return simpleHash(input);
    }
  }

  // Fallback for environments without crypto.subtle (like Node.js without polyfill)
  return simpleHash(input);
}

/**
 * Simple hash function fallback for environments without crypto.subtle
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(16, "0");
}

/**
 * Normalize an error into a consistent format
 * Handles Error objects, strings, and ErrorEvent objects
 */
export function normalizeError(
  error: Error | string | ErrorEvent | unknown,
): NormalizedError {
  // Handle Error objects
  if (error instanceof Error) {
    return {
      message: error.message || "Unknown error",
      stack: error.stack || "",
      name: error.name || "Error",
    };
  }

  // Handle ErrorEvent (from window.onerror)
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    "filename" in error
  ) {
    const evt = error as ErrorEvent;
    return {
      message: String(evt.message || "Unknown error"),
      stack: evt.error?.stack || "",
      name: evt.error?.name || "Error",
      lineno: (evt as { lineno?: number }).lineno,
      colno: (evt as { colno?: number }).colno,
      filename: String(evt.filename || ""),
    };
  }

  // Handle string errors
  if (typeof error === "string") {
    return {
      message: error,
      stack: "",
      name: "Error",
    };
  }

  // Handle unknown types
  try {
    return {
      message: String(error) || "Unknown error",
      stack: "",
      name: "Error",
    };
  } catch {
    return {
      message: "Unknown error",
      stack: "",
      name: "Error",
    };
  }
}

/**
 * Parse stack trace to extract file location and line numbers
 * Supports Chrome, Firefox, and Safari formats
 */
export function parseStackTrace(
  stack: string,
): { file?: string; line?: number; column?: number } | null {
  if (!stack) return null;

  const lines = stack.split("\n");

  for (const line of lines) {
    // Chrome format: "    at functionName (file.js:10:5)"
    const chromeMatch = line.match(/\((.+):(\d+):(\d+)\)/);
    if (chromeMatch) {
      return {
        file: chromeMatch[1],
        line: parseInt(chromeMatch[2], 10),
        column: parseInt(chromeMatch[3], 10),
      };
    }

    // Firefox format: "functionName@file.js:10:5"
    const firefoxMatch = line.match(/@(.+):(\d+):(\d+)/);
    if (firefoxMatch) {
      return {
        file: firefoxMatch[1],
        line: parseInt(firefoxMatch[2], 10),
        column: parseInt(firefoxMatch[3], 10),
      };
    }

    // Safari format: "functionName@file.js:10:5" or "file.js:10:5"
    const safariMatch = line.match(/([^@]+):(\d+):(\d+)/);
    if (safariMatch && safariMatch[1].includes(".")) {
      return {
        file: safariMatch[1],
        line: parseInt(safariMatch[2], 10),
        column: parseInt(safariMatch[3], 10),
      };
    }
  }

  return null;
}

/**
 * Check if error should be ignored
 * Filters out browser extension errors and known noise
 */
export function shouldIgnoreError(error: NormalizedError): boolean {
  const message = error.message.toLowerCase();
  const stack = error.stack.toLowerCase();

  // Ignore errors from browser extensions
  if (
    stack.includes("chrome-extension://") ||
    stack.includes("moz-extension://") ||
    stack.includes("safari-extension://")
  ) {
    return true;
  }

  // Ignore ResizeObserver errors (known browser noise)
  if (message.includes("resizeobserver loop")) {
    return true;
  }

  // Ignore script loading errors from ad blockers
  if (
    message.includes("failed to fetch") &&
    (stack.includes("adsbygoogle") || stack.includes("analytics"))
  ) {
    return true;
  }

  return false;
}

/**
 * Deduplicate errors within a time window
 * Returns true if error should be captured, false if it's a duplicate
 */
export class ErrorDeduplicator {
  private recentErrors = new Map<string, number>();
  private readonly windowMs: number;

  constructor(windowMs = 5000) {
    this.windowMs = windowMs;
  }

  shouldCapture(fingerprint: string): boolean {
    const now = Date.now();
    const lastSeen = this.recentErrors.get(fingerprint);

    if (lastSeen && now - lastSeen < this.windowMs) {
      // Duplicate within window - skip
      return false;
    }

    // Capture this error and update timestamp
    this.recentErrors.set(fingerprint, now);

    // Clean up old entries
    this.cleanup(now);

    return true;
  }

  private cleanup(now: number): void {
    for (const [fingerprint, timestamp] of this.recentErrors.entries()) {
      if (now - timestamp > this.windowMs * 2) {
        this.recentErrors.delete(fingerprint);
      }
    }
  }
}
