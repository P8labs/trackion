import { useState } from "react";
import { Button } from "@trackion/ui/button";
import { Input } from "@trackion/ui/input";
import { Checkbox } from "@trackion/ui/checkbox";
import { Label } from "@trackion/ui/label";
import { HugeiconsIcon } from "@hugeicons/react";
import { FilterIcon, ChevronDown } from "@hugeicons/core-free-icons";

interface AdvancedEventFilterProps {
  eventTypes: Array<{ key: string; label: string; count: number }>;
  selectedEventTypes: string[];
  onEventTypeChange: (types: string[]) => void;
  dateRange: { from: string; to: string };
  onDateRangeChange: (range: { from: string; to: string }) => void;
  sessionFilter: string;
  onSessionFilterChange: (session: string) => void;
  onReset: () => void;
}

export function AdvancedEventFilter({
  eventTypes,
  selectedEventTypes,
  onEventTypeChange,
  dateRange,
  onDateRangeChange,
  sessionFilter,
  onSessionFilterChange,
  onReset,
}: AdvancedEventFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeFilterCount = [
    selectedEventTypes.length > 0 && selectedEventTypes[0] !== "all" ? 1 : 0,
    dateRange.from || dateRange.to ? 1 : 0,
    sessionFilter ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const handleEventTypeChange = (type: string) => {
    if (type === "all") {
      onEventTypeChange(["all"]);
    } else {
      const newTypes = selectedEventTypes.includes(type)
        ? selectedEventTypes.filter((t) => t !== type)
        : [...selectedEventTypes.filter((t) => t !== "all"), type];
      onEventTypeChange(newTypes.length === 0 ? ["all"] : newTypes);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-border/60 bg-muted/15 hover:bg-muted/25 transition-colors"
      >
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={FilterIcon} className="h-4 w-4" />
          <span className="text-sm font-medium text-foreground">
            Advanced Filters
          </span>
          {activeFilterCount > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-semibold">
              {activeFilterCount}
            </span>
          )}
        </div>
        <HugeiconsIcon
          icon={ChevronDown}
          className={`h-4 w-4 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {isExpanded && (
        <div className="border border-border/60 rounded-lg bg-muted/15 p-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">
              Event Type
            </Label>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {eventTypes.map((type) => (
                <div key={type.key} className="flex items-center gap-2">
                  <Checkbox
                    id={`event-type-${type.key}`}
                    checked={selectedEventTypes.includes(type.key)}
                    onCheckedChange={() => handleEventTypeChange(type.key)}
                  />
                  <Label
                    htmlFor={`event-type-${type.key}`}
                    className="flex-1 cursor-pointer text-sm text-foreground font-normal flex items-center justify-between"
                  >
                    <span>{type.label}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {type.count}
                    </span>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date-from" className="text-sm font-semibold">
                Date From
              </Label>
              <Input
                id="date-from"
                type="datetime-local"
                value={dateRange.from}
                onChange={(e) =>
                  onDateRangeChange({
                    ...dateRange,
                    from: e.target.value,
                  })
                }
                className="h-9 text-sm border-border/60"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-to" className="text-sm font-semibold">
                Date To
              </Label>
              <Input
                id="date-to"
                type="datetime-local"
                value={dateRange.to}
                onChange={(e) =>
                  onDateRangeChange({
                    ...dateRange,
                    to: e.target.value,
                  })
                }
                className="h-9 text-sm border-border/60"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="session-filter" className="text-sm font-semibold">
              Session ID
            </Label>
            <Input
              id="session-filter"
              type="text"
              placeholder="Filter by session ID..."
              value={sessionFilter}
              onChange={(e) => onSessionFilterChange(e.target.value)}
              className="h-9 text-sm border-border/60"
            />
          </div>

          {activeFilterCount > 0 && (
            <Button
              variant="outline"
              onClick={onReset}
              className="w-full h-9 text-sm border-border/60"
            >
              Reset Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
