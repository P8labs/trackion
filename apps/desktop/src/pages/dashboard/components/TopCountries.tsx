import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useCountryData } from "@/hooks/useApi";
import { cn } from "@/lib/utils";

interface TopCountriesProps {
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
    return "?";
  }
  if (countryCode && countryCode.trim() !== "") {
    return countryCode.toUpperCase();
  }
  return "?";
}

export function TopCountries({ projectId }: TopCountriesProps) {
  const { data, isLoading, error } = useCountryData(projectId);

  if (isLoading) {
    return (
      <section className="h-90 flex flex-col">
        <div className="border-b border-border/60 px-4 py-3">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
            Top Countries
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Visitor origin by country
          </p>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <LoadingSpinner />
        </div>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="h-90 flex flex-col">
        <div className="border-b border-border/60 px-4 py-3">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
            Top Countries
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Visitor origin by country
          </p>
        </div>
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          No country data available
        </div>
      </section>
    );
  }

  const topCountries = data.slice(0, 8);

  if (topCountries.length === 0) {
    return (
      <section className="h-90 flex flex-col">
        <div className="border-b border-border/60 px-4 py-3">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
            Top Countries
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Visitor origin by country
          </p>
        </div>
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          No visitor data yet
        </div>
      </section>
    );
  }

  return (
    <section className="h-90 flex flex-col">
      <div className="border-b border-border/60 px-4 py-3">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
          Top Countries
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Visitor origin by country
        </p>
      </div>

      <div className="divide-y divide-border/40 overflow-y-auto flex-1">
        {topCountries.map((country) => {
          const flag = getCountryFlag(
            country.name,
            country.emoji,
            country.country_code,
          );

          return (
            <div
              key={country.name}
              className="flex items-center justify-between px-4 py-2.5 transition hover:bg-muted/20"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={cn("text-base text-center", flag == "?" && "mx-1")}
                >
                  {flag}
                </span>
                <span className="truncate text-sm font-medium text-foreground">
                  {country.name}
                </span>
              </div>

              <span className="font-mono text-sm text-muted-foreground">
                {country.count}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
