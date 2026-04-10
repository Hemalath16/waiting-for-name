import { cn } from "@/lib/utils";
import { SignalStatus } from "../types";

interface StatusDotProps {
  status: SignalStatus;
  className?: string;
  showLabel?: boolean;
}

const statusConfig: Record<
  SignalStatus,
  { color: string; label: string; pulse?: boolean }
> = {
  [SignalStatus.red]: {
    color: "bg-chart-3",
    label: "Red",
    pulse: true,
  },
  [SignalStatus.yellow]: {
    color: "bg-chart-2",
    label: "Yellow",
    pulse: true,
  },
  [SignalStatus.green]: {
    color: "bg-chart-1",
    label: "Green",
    pulse: false,
  },
};

export function StatusDot({
  status,
  className,
  showLabel = false,
}: StatusDotProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn("inline-flex items-center gap-1.5", className)}
      data-ocid={`status-dot-${status}`}
    >
      <span className="relative flex h-2.5 w-2.5">
        {config.pulse && (
          <span
            className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-60",
              config.color,
            )}
          />
        )}
        <span
          className={cn(
            "relative inline-flex rounded-full h-2.5 w-2.5",
            config.color,
          )}
        />
      </span>
      {showLabel && (
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          {config.label}
        </span>
      )}
    </span>
  );
}
