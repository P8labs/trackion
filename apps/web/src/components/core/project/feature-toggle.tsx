import { Checkbox } from "@trackion/ui/checkbox";

interface FeatureToggleProps {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}

export function ProjectFeatureToggle({
  title,
  description,
  checked,
  onChange,
  disabled,
}: FeatureToggleProps) {
  return (
    <label className="flex cursor-pointer items-start gap-3 border-b border-border/60 px-3 py-3 transition-colors odd:border-r hover:bg-muted/15 last:border-b-0 sm:nth-last-[-n+2]:border-b-0">
      <Checkbox
        checked={checked}
        onCheckedChange={(next) => onChange?.(!!next)}
        disabled={disabled}
      />
      <div className="space-y-1">
        <div className="text-sm font-medium leading-none">{title}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </label>
  );
}
