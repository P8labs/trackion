import { useCountryData } from "../../hooks/useApi";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { LoadingSpinner } from "../LoadingSpinner";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorldMapProps {
  projectId: string;
}

function getCountryFlag(
  countryName: string,
  emoji?: string,
  countryCode?: string,
): string {
  if (emoji && emoji.trim() !== "") {
    return emoji;
  }
  if (countryName.toLowerCase() === "unknown") {
    return "🌍";
  }
  if (countryCode && countryCode.trim() !== "") {
    return countryCode.toUpperCase();
  }
  return "🌍";
}

export function WorldMap({ projectId }: WorldMapProps) {
  const { data, isLoading, error } = useCountryData(projectId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Top Countries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Top Countries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground text-center py-4">
            No country data available
          </p>
        </CardContent>
      </Card>
    );
  }

  const topCountries = data.slice(0, 8);

  if (topCountries.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Top Countries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground text-center py-4">
            No visitor data yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Top Countries
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topCountries.map((country) => {
            const flag = getCountryFlag(
              country.name,
              country.emoji,
              country.country_code,
            );

            return (
              <div key={country.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={cn(
                        "text-base text-center",
                        flag == "?" && "mx-1",
                      )}
                    >
                      {flag}
                    </span>
                    <span className="font-medium truncate">{country.name}</span>
                  </div>
                  <span className="text-muted-foreground">{country.count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
