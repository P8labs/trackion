// Device and browser information utilities

export interface DeviceInfo {
  userAgent: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  screenResolution: string;
  viewport: string;
  language: string;
  timezone: string;
  platform: string;
}

/**
 * Parse user agent string to extract browser information
 */
function parseBrowser(userAgent: string): { browser: string; version: string } {
  const browsers = [
    { name: 'Chrome', regex: /Chrome\/([0-9.]+)/ },
    { name: 'Firefox', regex: /Firefox\/([0-9.]+)/ },
    { name: 'Safari', regex: /Version\/([0-9.]+).*Safari/ },
    { name: 'Edge', regex: /Edg\/([0-9.]+)/ },
    { name: 'Opera', regex: /OPR\/([0-9.]+)/ },
    { name: 'Internet Explorer', regex: /MSIE ([0-9.]+)/ }
  ];

  for (const browser of browsers) {
    const match = userAgent.match(browser.regex);
    if (match) {
      return { browser: browser.name, version: match[1] };
    }
  }

  return { browser: 'Unknown', version: 'Unknown' };
}

/**
 * Parse user agent string to extract OS information
 */
function parseOS(userAgent: string): { os: string; version: string } {
  const osList = [
    { name: 'Windows', regex: /Windows NT ([0-9.]+)/ },
    { name: 'macOS', regex: /Mac OS X ([0-9_.]+)/ },
    { name: 'Linux', regex: /Linux/ },
    { name: 'iOS', regex: /OS ([0-9_.]+) like Mac OS X/ },
    { name: 'Android', regex: /Android ([0-9.]+)/ }
  ];

  for (const os of osList) {
    const match = userAgent.match(os.regex);
    if (match) {
      return { 
        os: os.name, 
        version: match[1] ? match[1].replace(/_/g, '.') : 'Unknown'
      };
    }
  }

  return { os: 'Unknown', version: 'Unknown' };
}

/**
 * Determine device type based on user agent and screen size
 */
function getDeviceType(userAgent: string): 'desktop' | 'mobile' | 'tablet' {
  const mobileRegex = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  const tabletRegex = /iPad|Android.*(?=.*\bTablet\b)/i;
  
  if (tabletRegex.test(userAgent)) {
    return 'tablet';
  }
  if (mobileRegex.test(userAgent)) {
    return 'mobile';
  }
  return 'desktop';
}

/**
 * Get device name based on user agent
 */
function getDeviceName(userAgent: string): string {
  const devices = [
    { name: 'iPhone', regex: /iPhone/ },
    { name: 'iPad', regex: /iPad/ },
    { name: 'Android Phone', regex: /Android.*Mobile/ },
    { name: 'Android Tablet', regex: /Android(?!.*Mobile)/ },
    { name: 'Windows Phone', regex: /Windows Phone/ },
    { name: 'BlackBerry', regex: /BlackBerry/ }
  ];

  for (const device of devices) {
    if (device.regex.test(userAgent)) {
      return device.name;
    }
  }

  return 'Desktop';
}

/**
 * Collect comprehensive device information
 */
export function getDeviceInfo(): DeviceInfo {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {
      userAgent: "",
      browser: "Unknown",
      browserVersion: "Unknown",
      os: "Unknown",
      osVersion: "Unknown",
      device: "Unknown",
      deviceType: "desktop",
      screenResolution: "0x0",
      viewport: "0x0",
      language: "Unknown",
      timezone: "Unknown",
      platform: "Unknown"
    };
  }

  const userAgent = navigator.userAgent;
  const browser = parseBrowser(userAgent);
  const os = parseOS(userAgent);
  
  return {
    userAgent,
    browser: browser.browser,
    browserVersion: browser.version,
    os: os.os,
    osVersion: os.version,
    device: getDeviceName(userAgent),
    deviceType: getDeviceType(userAgent),
    screenResolution: window.screen ? `${window.screen.width}x${window.screen.height}` : "0x0",
    viewport: `${window.innerWidth || 0}x${window.innerHeight || 0}`,
    language: navigator.language || 'Unknown',
    timezone: typeof Intl !== "undefined" ? (Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown') : 'Unknown',
    platform: navigator.platform || 'Unknown'
  };
}

/**
 * Get a simplified device info object for events
 */
export function getEventDeviceInfo(): Record<string, string | number> {
  const deviceInfo = getDeviceInfo();
  
  return {
    user_agent: deviceInfo.userAgent,
    browser: deviceInfo.browser,
    browser_version: deviceInfo.browserVersion,
    os: deviceInfo.os,
    os_version: deviceInfo.osVersion,
    device: deviceInfo.device,
    device_type: deviceInfo.deviceType,
    screen_resolution: deviceInfo.screenResolution,
    viewport: deviceInfo.viewport,
    language: deviceInfo.language,
    timezone: deviceInfo.timezone,
    platform: deviceInfo.platform
  };
}