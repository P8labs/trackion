import { useQuery } from "@tanstack/react-query";
import { Icons } from "@/lib/icons";
import { Download, ExternalLink } from "lucide-react";
import { PublicPageLayout } from "./components/PublicPageLayout";
import moment from "moment";
import {
  Alert,
  Anchor,
  Button,
  Divider,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";

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
    .replace(/\.(exe|msi|zip|apk)$/, "")
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
    <li className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Download className="size-4 text-muted-foreground" />

          <a
            href={asset.browser_download_url}
            target="_blank"
            rel="noreferrer"
            className="font-medium hover:underline truncate"
          >
            {display}
          </a>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>{formatBytes(asset.size)}</span>

          {asset.digest && (
            <span className="font-mono">
              SHA256 {asset.digest.replace("sha256:", "").slice(0, 12)}...
            </span>
          )}
        </div>
      </div>

      <Button
        component="a"
        href={asset.browser_download_url}
        target="_blank"
        size="xs"
      >
        Download
      </Button>
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
      !asset.name.startsWith("app-") &&
      !asset.name.endsWith(".sig") &&
      asset.name !== "latest.json",
  );

  const serverAssets = assets.filter(
    (asset) =>
      asset.name.startsWith("trackion-server_") && !asset.name.endsWith(".sig"),
  );

  const mobileAssets = assets.filter((asset) => asset.name.startsWith("app-"));

  return (
    <PublicPageLayout>
      <Stack gap="xl">
        <div className="flex flex-col gap-4 items-center">
          <Title order={1}>Downloads</Title>

          <Text c="dimmed" mt={4}>
            Download the latest Trackion desktop, mobile, and self-hosted
            builds.
          </Text>
        </div>

        {latestRelease && (
          <>
            <Divider />

            <Group justify="space-between" align="flex-start">
              <div>
                <Text fw={600} size="lg">
                  {latestRelease.name || latestRelease.tag_name}
                </Text>

                <Text size="sm" c="dimmed">
                  {latestRelease.tag_name} published{" "}
                  {moment(latestRelease.published_at).fromNow()}
                </Text>
              </div>

              <Group gap="xs">
                <Button
                  component="a"
                  href={latestRelease.html_url}
                  target="_blank"
                  rightSection={<ExternalLink size={14} />}
                >
                  Release notes
                </Button>

                <Button
                  component="a"
                  href="https://github.com/P8labs/trackion/releases"
                  target="_blank"
                  variant="default"
                  leftSection={<Icons.github size={14} />}
                >
                  All releases
                </Button>
              </Group>
            </Group>
          </>
        )}

        {isLoading && (
          <Text c="dimmed">Loading latest release from GitHub...</Text>
        )}

        {isError && (
          <Alert color="red" variant="light">
            Failed to fetch release information.
          </Alert>
        )}

        {!isLoading && !isError && (
          <>
            <Divider />

            <Stack gap="sm">
              <Title order={3}>Mobile</Title>

              {mobileAssets.length > 0 ? (
                mobileAssets.map((asset) => (
                  <CompactAssetRow
                    key={asset.id}
                    asset={asset}
                    label={formatAssetLabel(asset.name)}
                  />
                ))
              ) : (
                <Text size="sm" c="dimmed">
                  No mobile builds available.
                </Text>
              )}
            </Stack>

            <Divider />

            <Stack gap="sm">
              <Title order={3}>Desktop</Title>

              {desktopAssets.length > 0 ? (
                desktopAssets.map((asset) => (
                  <CompactAssetRow
                    key={asset.id}
                    asset={asset}
                    label={formatAssetLabel(asset.name)}
                  />
                ))
              ) : (
                <Text size="sm" c="dimmed">
                  No desktop builds available.
                </Text>
              )}
            </Stack>

            <Divider />

            <Stack gap="sm">
              <Title order={3}>Self-Hosted Server</Title>

              {serverAssets.length > 0 ? (
                serverAssets.map((asset) => (
                  <CompactAssetRow
                    key={asset.id}
                    asset={asset}
                    label={formatAssetLabel(asset.name)}
                  />
                ))
              ) : (
                <Text size="sm" c="dimmed">
                  No server builds available.
                </Text>
              )}
            </Stack>

            <Divider />

            <Stack gap="xs">
              <Title order={4}>Documentation</Title>

              <Group gap="md">
                <Anchor href="/docs/desktop-development" target="_blank">
                  Desktop Development
                </Anchor>

                <Anchor href="/docs/self-hosting" target="_blank">
                  Self Hosting
                </Anchor>
              </Group>
            </Stack>

            <Alert color="yellow" variant="default" title="Windows builds">
              Windows binaries are currently unsigned and may trigger Microsoft
              SmartScreen warnings. Verify the published SHA256 checksum before
              installing if required.
            </Alert>
          </>
        )}

        {!isLoading && !isError && !latestRelease && (
          <Text c="dimmed">Latest release information is unavailable.</Text>
        )}
      </Stack>
    </PublicPageLayout>
  );
}
