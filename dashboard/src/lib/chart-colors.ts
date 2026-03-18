/**
 * Chart color utilities that work with the design system
 * Uses CSS custom properties for theme-aware chart colors
 */

export function getChartColors(): string[] {
  // Use CSS custom properties that respond to theme changes
  return [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];
}

export function getDeviceColors(): string[] {
  const colors = getChartColors();
  return [
    colors[0], // chart-1
    colors[1], // chart-2
    colors[2], // chart-3
    colors[3], // chart-4
    colors[4], // chart-5
    "hsl(var(--primary))", // fallback to primary for 6th item
  ];
}

export function getLocationColors(): string[] {
  const colors = getChartColors();
  return colors.slice(0, 4); // Use first 4 colors for locations
}

export function getSemanticColors() {
  return {
    background: "hsl(var(--background))",
    foreground: "hsl(var(--foreground))",
    muted: "hsl(var(--muted))",
    mutedForeground: "hsl(var(--muted-foreground))",
    border: "hsl(var(--border))",
    primary: "hsl(var(--primary))",
    secondary: "hsl(var(--secondary))",
  };
}
