import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, AlertTriangle, Clock, MapPin, Radio } from "lucide-react";
import { motion } from "motion/react";
import { SharedMap } from "../components/SharedMap";
import { StatusDot } from "../components/StatusDot";
import { UrgencyBadge } from "../components/UrgencyBadge";
import { useEmergencyMessages } from "../hooks/use-emergency-messages";
import { useSignals } from "../hooks/use-signals";
import { SignalStatus } from "../types";
import type { EmergencyMessageView, TrafficSignalView } from "../types";

// --- Helpers ---
function formatTimeAgo(nanoTs: bigint): string {
  const ms = Number(nanoTs) / 1_000_000;
  const diffSec = Math.floor((Date.now() - ms) / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  return `${Math.floor(diffSec / 3600)}h ago`;
}

// --- Stats Bar ---
function StatsBar({ signals }: { signals: TrafficSignalView[] }) {
  const red = signals.filter((s) => s.status === SignalStatus.red).length;
  const yellow = signals.filter((s) => s.status === SignalStatus.yellow).length;
  const green = signals.filter((s) => s.status === SignalStatus.green).length;

  const stats = [
    { label: "Total Signals", value: signals.length, color: "text-foreground" },
    { label: "Green", value: green, color: "text-chart-1" },
    { label: "Yellow", value: yellow, color: "text-chart-2" },
    { label: "Red", value: red, color: "text-chart-3" },
  ];

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      data-ocid="traffic-user-stats-bar"
    >
      {stats.map(({ label, value, color }) => (
        <Card key={label} className="border-border">
          <CardContent className="p-3 text-center">
            <p className={`text-2xl font-display font-bold ${color}`}>
              {value}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono uppercase tracking-wide">
              {label}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// --- Read-only Signal Row ---
function SignalRow({ signal }: { signal: TrafficSignalView }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-card border border-border hover:border-muted-foreground/30 transition-colors"
      data-ocid={`user-signal-row-${signal.id}`}
    >
      <StatusDot status={signal.status} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate font-mono">{signal.location}</span>
        </div>
        <p className="text-sm font-semibold text-foreground">
          Signal #{signal.id.toString()}
        </p>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
        <StatusDot status={signal.status} showLabel />
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 ml-2">
        <Clock className="w-3 h-3" />
        <span className="font-mono">{formatTimeAgo(signal.lastUpdated)}</span>
      </div>
    </motion.div>
  );
}

// --- Alert Card ---
function AlertCard({ msg }: { msg: EmergencyMessageView }) {
  const borderColor =
    msg.urgency === "critical"
      ? "oklch(var(--chart-3))"
      : msg.urgency === "high"
        ? "oklch(var(--chart-2))"
        : "oklch(var(--chart-1))";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="emergency-card border-l-4"
      style={{ borderLeftColor: borderColor }}
      data-ocid={`user-alert-card-${msg.id}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <UrgencyBadge urgency={msg.urgency} />
        <span className="text-xs text-muted-foreground font-mono shrink-0">
          {new Date(Number(msg.timestamp) / 1_000_000).toLocaleTimeString()}
        </span>
      </div>
      <p className="text-sm text-foreground leading-snug line-clamp-2 mb-2">
        {msg.message}
      </p>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <MapPin className="w-3 h-3 shrink-0" />
        <span className="truncate font-mono">{msg.location}</span>
      </div>
    </motion.div>
  );
}

// --- Main TrafficUser ---
export function TrafficUser() {
  const { data: signals = [], isLoading: signalsLoading } = useSignals();
  const { data: messages = [], isLoading: msgsLoading } =
    useEmergencyMessages();

  const activeAlerts = messages
    .filter((m) => !m.resolved)
    .sort((a, b) => {
      const order: Record<string, number> = { critical: 0, high: 1, normal: 2 };
      return (order[a.urgency] ?? 2) - (order[b.urgency] ?? 2);
    });

  return (
    <div
      className="max-w-screen-xl mx-auto px-4 py-6 flex flex-col gap-6"
      data-ocid="traffic-user-panel"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-lg"
          style={{
            backgroundColor: "oklch(var(--primary) / 0.12)",
            border: "1px solid oklch(var(--primary) / 0.3)",
          }}
        >
          <Activity
            className="w-5 h-5"
            style={{ color: "oklch(var(--primary))" }}
          />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">
            Traffic Status — Live View
          </h1>
          <p className="text-sm text-muted-foreground">
            Real-time signal status and emergency alerts
          </p>
        </div>
        <Badge variant="outline" className="ml-auto text-xs font-mono gap-1.5">
          <Radio className="w-3 h-3 animate-pulse" />
          Live · 3s
        </Badge>
      </div>

      {/* Stats Bar */}
      {signalsLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {["s1", "s2", "s3", "s4"].map((k) => (
            <Skeleton key={k} className="h-[68px] rounded-lg" />
          ))}
        </div>
      ) : (
        <StatsBar signals={signals} />
      )}

      {/* Map */}
      <Card className="border-border" data-ocid="traffic-user-map-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 font-display">
            <MapPin
              className="w-4 h-4"
              style={{ color: "oklch(var(--primary))" }}
            />
            Live Traffic Map
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <SharedMap height={300} />
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-chart-1 inline-block" />
              Green signal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-chart-2 inline-block" />
              Yellow signal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-chart-3 inline-block" />
              Red signal
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="w-3.5 h-3.5 rounded-full inline-block border-2"
                style={{
                  background: "oklch(var(--chart-2))",
                  borderColor: "oklch(var(--chart-3))",
                }}
              />
              Emergency alert
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Signal Status Grid */}
      <section data-ocid="traffic-user-signals-section">
        <div className="flex items-center gap-2 mb-3">
          <Activity
            className="w-4 h-4"
            style={{ color: "oklch(var(--primary))" }}
          />
          <h2 className="text-base font-display font-semibold text-foreground">
            Signal Status Grid
          </h2>
          <Badge variant="outline" className="ml-auto text-xs font-mono">
            {signals.length} signals
          </Badge>
        </div>

        {signalsLoading ? (
          <div className="flex flex-col gap-2">
            {["r1", "r2", "r3", "r4"].map((k) => (
              <Skeleton key={k} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : signals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2 border border-dashed border-border rounded-lg">
            <Activity className="w-8 h-8 opacity-30" />
            <p className="text-sm">No signals found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {signals.map((signal, i) => (
              <motion.div
                key={signal.id.toString()}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <SignalRow signal={signal} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Current Alerts */}
      <section data-ocid="traffic-user-alerts-section">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle
            className="w-4 h-4"
            style={{ color: "oklch(var(--chart-3))" }}
          />
          <h2 className="text-base font-display font-semibold text-foreground">
            Current Alerts
          </h2>
          {activeAlerts.length > 0 && (
            <Badge
              className="ml-auto text-xs font-mono"
              style={{
                backgroundColor: "oklch(var(--chart-3) / 0.15)",
                color: "oklch(var(--chart-3))",
                borderColor: "oklch(var(--chart-3) / 0.4)",
              }}
              variant="outline"
            >
              {activeAlerts.length} active
            </Badge>
          )}
        </div>

        {msgsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {["a1", "a2"].map((k) => (
              <Skeleton key={k} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : activeAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2 border border-dashed border-border rounded-lg">
            <AlertTriangle className="w-8 h-8 opacity-30" />
            <p className="text-sm font-medium">No active alerts</p>
            <p className="text-xs">All clear — no emergency messages pending</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeAlerts.map((msg, i) => (
              <motion.div
                key={msg.id.toString()}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <AlertCard msg={msg} />
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
