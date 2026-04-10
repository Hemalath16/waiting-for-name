import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Urgency } from "../types";

interface UrgencyBadgeProps {
  urgency: Urgency;
  className?: string;
}

const urgencyConfig: Record<Urgency, { label: string; className: string }> = {
  [Urgency.critical]: {
    label: "Critical",
    className:
      "bg-chart-3 text-foreground border-chart-3 hover:bg-chart-3/80 font-semibold",
  },
  [Urgency.high]: {
    label: "High",
    className:
      "bg-chart-2 text-card border-chart-2 hover:bg-chart-2/80 font-semibold",
  },
  [Urgency.normal]: {
    label: "Normal",
    className:
      "bg-chart-1 text-card border-chart-1 hover:bg-chart-1/80 font-semibold",
  },
};

export function UrgencyBadge({ urgency, className }: UrgencyBadgeProps) {
  const config = urgencyConfig[urgency];
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs uppercase tracking-wide",
        config.className,
        className,
      )}
      data-ocid={`urgency-badge-${urgency}`}
    >
      {config.label}
    </Badge>
  );
}
