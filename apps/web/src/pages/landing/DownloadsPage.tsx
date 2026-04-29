import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Icons } from "@/lib/icons";
import { Download, ExternalLink } from "lucide-react";
import { PublicPageLayout } from "./components/PublicPageLayout";
import { FullLine, PLine } from "@/components/Line";
import moment from "moment";
import { Link } from "react-router-dom";

type GithubAsset = {
  id: number;
  name: string;
  size: number;
  digest?: string;
  browser_download_url: string;
};

type GithubRelease = {
  id: number;
  tag_name: string;
  name: string;
  draft: boolean;
  prerelease: boolean;
  html_url: string;
  published_at: string;
  assets: GithubAsset[];
};

const LATEST_RELEASE_API =
  "https://api.github.com/repos/P8labs/trackion/releases/latest";

const formatBytes = (bytes: number) => {
  if (!bytes) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const order = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** order;
  return `${value >= 10 ? value.toFixed(0) : value.toFixed(1)} ${units[order]}`;
};

function formatAssetLabel(name: string) {
  if (name.startsWith("trackion-server_")) {
    const tail = name.replace(/^trackion-server_[^_]+_?/, "");
    const parts = tail.split(/[_\-\.]+/).filter(Boolean);
    const os = parts[0] ? parts[0].toUpperCase() : "Server";
    const arch = parts[1] ? parts[1].replace("armv7", "armv7") : "";
    return `${os}${arch ? ` (${arch})` : ""}`;
  }

  if (name.endsWith(".zip")) return "Portable (ZIP)";
  if (name.includes("setup.exe")) return "Windows Installer (EXE)";
  if (name.endsWith(".msi")) return "Windows MSI Installer";
  if (name.endsWith(".msi.sig") || name.endsWith(".sig")) return "Signature";
  if (name === "latest.json") return "latest.json";

  const pretty = name
    .replace(/trackion[_-]?/i, "")
    .replace(/v?\d+\.\d+\.\d+[_-]?/i, "")
    .replace(/[_\-]+/g, " ")
    .replace(/\.(exe|msi|zip)$/, "")
    .trim();
  return pretty || name;
}

function CompactAssetRow({
  asset,
  label,
}: {
  asset: GithubAsset;
  label?: string;
}) {
  const display = label || formatAssetLabel(asset.name);
  return (
    <li className="flex items-start justify-between gap-3 rounded-lg border border-border/60 px-3 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium break-all">{display}</p>
        <p className="text-[11px] text-muted-foreground mt-1">
          {formatBytes(asset.size)}
        </p>
        <p className="text-[11px] text-muted-foreground mt-1 font-mono break-all">
          SHA256: {asset.digest?.replace("sha256:", "") || "Not available"}
        </p>
      </div>

      <a href={asset.browser_download_url} target="_blank" rel="noreferrer">
        <Button size="sm" variant="outline" className="h-8 px-2.5">
          <Download className="h-3.5 w-3.5" />
        </Button>
      </a>
    </li>
  );
}

export default function DownloadsPage() {
  const {
    data: latestRelease,
    isLoading,
    isError,
  } = useQuery<GithubRelease>({
    queryKey: ["github-latest-release", "trackion"],
    queryFn: async () => {
      const response = await fetch(LATEST_RELEASE_API, {
        headers: { Accept: "application/vnd.github+json" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch latest release");
      }

      return (await response.json()) as GithubRelease;
    },
    staleTime: 5 * 60 * 1000,
  });

  const assets = latestRelease?.assets ?? [];
  const desktopAssets = assets.filter(
    (asset) =>
      asset.name.startsWith("trackion_") &&
      !asset.name.startsWith("trackion-server_") &&
      !asset.name.endsWith(".sig") &&
      asset.name !== "latest.json",
  );
  const serverAssets = assets.filter(
    (asset) =>
      asset.name.startsWith("trackion-server_") && !asset.name.endsWith(".sig"),
  );

  return (
    <PublicPageLayout>
      <PLine />
      <div className="p-6 pt-12 md:pt-16">
        <div className="text-center mb-10 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Downloads
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Latest release binaries with SHA256 checksums.
          </p>

          <div className="mt-6 flex justify-center gap-3 flex-wrap">
            <a
              href="https://github.com/P8labs/trackion/releases"
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="secondary" className="gap-2">
                <Icons.github className="h-4 w-4" />
                Older Versions
              </Button>
            </a>
            <Link to="/auth">
              <Button className="gap-2">
                Open Dashboard
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Need an older build? Download previous versions from GitHub
            Releases.
          </p>
        </div>

        {latestRelease && (
          <section className="mb-8 rounded-2xl border border-border/60 bg-muted/30 p-5 md:p-6">
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Latest
            </p>
            <div className="mt-2 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-lg font-semibold">
                  {latestRelease.name || latestRelease.tag_name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {latestRelease.tag_name} published{" "}
                  {moment(latestRelease.published_at).fromNow()}
                </p>
              </div>
              <a href={latestRelease.html_url} target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm" className="gap-2">
                  Release Notes
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>
            </div>
          </section>
        )}

        <section className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-3">Desktop Client</h2>
            <ul className="space-y-2">
              {desktopAssets.map((asset) => (
                <CompactAssetRow
                  key={asset.id}
                  asset={asset}
                  label={formatAssetLabel(asset.name)}
                />
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Server</h2>
            <ul className="space-y-2">
              {serverAssets.map((asset) => (
                <CompactAssetRow
                  key={asset.id}
                  asset={asset}
                  label={formatAssetLabel(asset.name)}
                />
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-4">
            <p className="text-sm font-medium text-foreground">
              Windows notice
            </p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              The Windows client is currently unsigned, so Microsoft SmartScreen
              may show a warning. This project is open-source and the published
              build is safe to use. Verify the SHA256 hash before running the
              installer.
            </p>
          </div>

          <div className="rounded-xl border border-border/60 p-4">
            <p className="text-sm font-medium">Documentation</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href="/docs/desktop-development"
                target="_blank"
                rel="noreferrer"
              >
                <Button size="sm" variant="outline">
                  Desktop Docs
                </Button>
              </a>
              <a href="/docs/self-hosting" target="_blank" rel="noreferrer">
                <Button size="sm" variant="outline">
                  Server Docs
                </Button>
              </a>
            </div>
          </div>

          {isLoading && (
            <div className="rounded-xl border border-border/60 p-4 text-sm text-muted-foreground">
              Loading latest release from GitHub...
            </div>
          )}

          {isError && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              Failed to fetch the latest release. Please try again in a moment.
            </div>
          )}

          {!isLoading && !isError && !latestRelease && (
            <div className="rounded-xl border border-border/60 p-4 text-sm text-muted-foreground">
              Latest release is unavailable right now.
            </div>
          )}
        </section>
      </div>
      <FullLine />
    </PublicPageLayout>
  );
}
