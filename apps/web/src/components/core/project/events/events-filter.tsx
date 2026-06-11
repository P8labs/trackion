import { useState } from "react";
import {
  Badge,
  Button,
  Checkbox,
  Collapse,
  Group,
  Stack,
  Text,
  TextInput,
  ActionIcon,
  Paper,
} from "@mantine/core";

import { ChevronDown, Filter } from "lucide-react";
import { cn } from "@trackion/ui/lib";

interface AdvancedEventFilterProps {
  eventTypes: Array<{
    key: string;
    label: string;
    count: number;
  }>;
  selectedEventTypes: string[];
  onEventTypeChange: (types: string[]) => void;
  dateRange: {
    from: string;
    to: string;
  };
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
  const [opened, setOpened] = useState(false);

  const activeFilterCount = [
    selectedEventTypes.length > 0 && selectedEventTypes[0] !== "all" ? 1 : 0,
    dateRange.from || dateRange.to ? 1 : 0,
    sessionFilter ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const handleEventTypeChange = (type: string) => {
    if (type === "all") {
      onEventTypeChange(["all"]);
      return;
    }

    const nextTypes = selectedEventTypes.includes(type)
      ? selectedEventTypes.filter((t) => t !== type)
      : [...selectedEventTypes.filter((t) => t !== "all"), type];

    onEventTypeChange(nextTypes.length === 0 ? ["all"] : nextTypes);
  };

  return (
    <Stack gap={0}>
      <Paper
        withBorder
        variant="light"
        className={cn(
          opened && "rounded-b-none!",
          "px-2 md:px-6 py-2 flex! justify-between items-center cursor-pointer",
        )}
        radius="md"
        onClick={() => setOpened((v) => !v)}
      >
        <Group gap="xs">
          <Filter size={16} />

          <Text fw={500} size="sm">
            Filters
          </Text>

          {activeFilterCount > 0 && (
            <Badge variant="light" size="sm">
              {activeFilterCount}
            </Badge>
          )}
        </Group>

        <ActionIcon variant="subtle" onClick={() => setOpened((v) => !v)}>
          <ChevronDown
            size={16}
            className={
              opened
                ? "rotate-180 transition-transform"
                : "transition-transform"
            }
          />
        </ActionIcon>
      </Paper>

      <Collapse expanded={opened}>
        <div className="px-5 md:px-6 py-5">
          <Stack gap="lg">
            <div>
              <Text size="xs" fw={600} c="dimmed" mb="sm">
                EVENT TYPES
              </Text>

              <Stack gap="xs">
                {eventTypes.map((type) => (
                  <Checkbox
                    key={type.key}
                    checked={selectedEventTypes.includes(type.key)}
                    onChange={() => handleEventTypeChange(type.key)}
                    label={
                      <Group justify="space-between" w="100%">
                        <Text size="sm">{type.label}</Text>

                        <Text size="xs" c="dimmed">
                          {type.count}
                        </Text>
                      </Group>
                    }
                  />
                ))}
              </Stack>
            </div>

            <Group grow>
              <TextInput
                type="datetime-local"
                label="Date From"
                value={dateRange.from}
                onChange={(e) =>
                  onDateRangeChange({
                    ...dateRange,
                    from: e.currentTarget.value,
                  })
                }
              />

              <TextInput
                type="datetime-local"
                label="Date To"
                value={dateRange.to}
                onChange={(e) =>
                  onDateRangeChange({
                    ...dateRange,
                    to: e.currentTarget.value,
                  })
                }
              />
            </Group>

            <TextInput
              label="Session ID"
              placeholder="Filter by session ID..."
              value={sessionFilter}
              onChange={(e) => onSessionFilterChange(e.currentTarget.value)}
            />

            {activeFilterCount > 0 && (
              <Button variant="default" onClick={onReset}>
                Reset Filters
              </Button>
            )}
          </Stack>
        </div>
      </Collapse>
    </Stack>
  );
}
