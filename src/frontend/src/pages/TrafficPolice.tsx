import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Send,
  Shield,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SharedMap } from "../components/SharedMap";
import { UrgencyBadge } from "../components/UrgencyBadge";
import { useMapContext } from "../context/MapContext";
import {
  useAcknowledgeEmergencyMessage,
  useDispatchEmergencyMessage,
  useEmergencyMessages,
  useResolveEmergencyMessage,
} from "../hooks/use-emergency-messages";
import type { EmergencyMessageView } from "../types";
import { Urgency } from "../types";

// ── Types ─────────────────────────────────────────────────────────────────────

type FilterKey = "all" | "new" | "acknowledged" | "dispatched" | "resolved";

// ── Status label helper ───────────────────────────────────────────────────────

function getStatusLabel(msg: EmergencyMessageView): {
  label: string;
  color: string;
} {
  if (msg.resolved) return { label: "RESOLVED", color: "text-chart-1" };
  if (msg.dispatched) return { label: "DISPATCHED", color: "text-primary" };
  if (msg.response) return { label: "RESPONDED", color: "text-chart-2" };
  if (msg.acknowledged)
    return { label: "ACKNOWLEDGED", color: "text-muted-foreground" };
  return { label: "NEW", color: "text-chart-3" };
}

// ── Filter helpers ────────────────────────────────────────────────────────────

function matchesFilter(msg: EmergencyMessageView, filter: FilterKey): boolean {
  switch (filter) {
    case "all":
      return true;
    case "new":
      return !msg.resolved && !msg.acknowledged && !msg.dispatched;
    case "acknowledged":
      return msg.acknowledged && !msg.dispatched && !msg.resolved;
    case "dispatched":
      return msg.dispatched && !msg.resolved;
    case "resolved":
      return msg.resolved;
  }
}

// ── Alert card ────────────────────────────────────────────────────────────────

function PoliceAlertCard({ msg }: { msg: EmergencyMessageView }) {
  const { mutate: acknowledge, isPending: ackPending } =
    useAcknowledgeEmergencyMessage();
  const { mutate: dispatch, isPending: dispatchPending } =
    useDispatchEmergencyMessage();
  const { mutate: resolve, isPending: resolvePending } =
    useResolveEmergencyMessage();

  const borderColor =
    msg.urgency === Urgency.critical
      ? "oklch(var(--chart-3))"
      : msg.urgency === Urgency.high
        ? "oklch(var(--chart-2))"
        : "oklch(var(--chart-1))";

  const status = getStatusLabel(msg);

  return (
    <div
      className="emergency-card border-l-4 flex flex-col gap-3"
      style={{ borderLeftColor: borderColor }}
      data-ocid={`police-alert-${msg.id}`}
    >
      {/* Top row: urgency + status */}
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <UrgencyBadge urgency={msg.urgency} />
        <span
          className={`text-xs font-mono font-bold uppercase tracking-widest ${status.color}`}
          data-ocid={`police-alert-status-${msg.id}`}
        >
          {status.label}
        </span>
      </div>

      {/* Message text */}
      <p className="text-sm text-foreground leading-snug">{msg.message}</p>

      {/* Meta row */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1 min-w-0">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="font-mono truncate">{msg.location}</span>
        </span>
        <span className="flex items-center gap-1 shrink-0">
          <Clock className="w-3 h-3" />
          {new Date(Number(msg.timestamp) / 1_000_000).toLocaleString()}
        </span>
      </div>

      {/* Dispatch timestamp if dispatched */}
      {msg.dispatched && msg.dispatchedAt && (
        <p className="text-xs text-muted-foreground font-mono flex items-center gap-1">
          <Truck className="w-3 h-3" />
          Dispatched at{" "}
          {new Date(Number(msg.dispatchedAt) / 1_000_000).toLocaleTimeString()}
        </p>
      )}

      {/* Response text if present */}
      {msg.response && (
        <div className="rounded-sm px-3 py-2 text-xs text-muted-foreground bg-muted/40">
          <span className="font-mono uppercase tracking-wide text-xs mr-2">
            Response:
          </span>
          {msg.response}
        </div>
      )}

      {/* Action buttons — only for unresolved */}
      {!msg.resolved && (
        <div className="flex gap-2 flex-wrap">
          {!msg.acknowledged && (
            <Button
              size="sm"
              variant="outline"
              disabled={ackPending}
              onClick={() =>
                acknowledge(msg.id, {
                  onSuccess: () => toast.success("Alert acknowledged"),
                  onError: () => toast.error("Failed to acknowledge"),
                })
              }
              className="h-7 text-xs gap-1"
              data-ocid={`ack-alert-${msg.id}`}
            >
              <CheckCircle2 className="w-3 h-3" />
              Acknowledge
            </Button>
          )}
          {!msg.dispatched && (
            <Button
              size="sm"
              variant="default"
              disabled={dispatchPending}
              onClick={() =>
                dispatch(msg.id, {
                  onSuccess: () => toast.success("Unit dispatched"),
                  onError: () => toast.error("Failed to dispatch"),
                })
              }
              className="h-7 text-xs gap-1 font-semibold"
              data-ocid={`dispatch-alert-${msg.id}`}
            >
              <Send className="w-3 h-3" />
              Dispatch Unit
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            disabled={resolvePending}
            onClick={() =>
              resolve(msg.id, {
                onSuccess: () => toast.success("Alert resolved"),
                onError: () => toast.error("Failed to resolve"),
              })
            }
            className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
            data-ocid={`resolve-alert-${msg.id}`}
          >
            <CheckCircle2 className="w-3 h-3" />
            Resolve
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Filter button ─────────────────────────────────────────────────────────────

interface FilterButtonProps {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  ocid: string;
}

function FilterButton({
  label,
  count,
  active,
  onClick,
  ocid,
}: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-ocid={ocid}
      className={[
        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wide transition-colors duration-150",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border border-border",
      ].join(" ")}
    >
      {label}
      <span
        className={[
          "inline-flex items-center justify-center min-w-[1.2rem] h-4 px-1 rounded-full text-[10px] font-bold",
          active
            ? "bg-primary-foreground/20 text-primary-foreground"
            : "bg-border text-muted-foreground",
        ].join(" ")}
      >
        {count}
      </span>
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function TrafficPolice() {
  const { data: messages = [], isLoading } = useEmergencyMessages();
  const { alertMarkers } = useMapContext();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  // Stats
  const active = messages.filter((m) => !m.resolved);
  const criticalCount = active.filter(
    (m) => m.urgency === Urgency.critical,
  ).length;
  const pendingDispatch = active.filter((m) => !m.dispatched).length;

  // Filter counts
  const filterCounts: Record<FilterKey, number> = {
    all: messages.length,
    new: messages.filter((m) => matchesFilter(m, "new")).length,
    acknowledged: messages.filter((m) => matchesFilter(m, "acknowledged"))
      .length,
    dispatched: messages.filter((m) => matchesFilter(m, "dispatched")).length,
    resolved: messages.filter((m) => matchesFilter(m, "resolved")).length,
  };

  const filteredMessages = [...messages]
    .filter((m) => matchesFilter(m, activeFilter))
    .sort((a, b) => {
      // Unresolved first, then by urgency
      if (a.resolved !== b.resolved) return a.resolved ? 1 : -1;
      const order: Record<string, number> = {
        critical: 0,
        high: 1,
        normal: 2,
      };
      return (order[a.urgency] ?? 2) - (order[b.urgency] ?? 2);
    });

  const alertMarkerCount = alertMarkers.filter(
    (m) => m.type === "alert",
  ).length;

  return (
    <div
      className="max-w-screen-xl mx-auto px-4 py-6 flex flex-col gap-6"
      data-ocid="traffic-police-panel"
    >
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
          style={{
            backgroundColor: "oklch(var(--secondary) / 0.15)",
            border: "1px solid oklch(var(--secondary) / 0.3)",
          }}
        >
          <Shield
            className="w-5 h-5"
            style={{ color: "oklch(var(--secondary))" }}
          />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-display font-bold text-foreground leading-tight">
            Traffic Police — Dispatch Center
          </h1>
          <p className="text-sm text-muted-foreground">
            Field operations, incident acknowledgement and dispatch
          </p>
        </div>
        <Badge
          variant="outline"
          className="ml-auto text-xs font-mono shrink-0"
          data-ocid="police-live-badge"
        >
          Live · 3s
        </Badge>
      </div>

      {/* ── Stats row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Active Alerts",
            value: active.length,
            color: "text-foreground",
          },
          {
            label: "Critical",
            value: criticalCount,
            color: "text-chart-3",
          },
          {
            label: "Pending Dispatch",
            value: pendingDispatch,
            color: "text-chart-2",
          },
        ].map(({ label, value, color }) => (
          <Card key={label} className="border-border">
            <CardContent className="p-3 text-center">
              <p className={`text-2xl font-display font-bold ${color}`}>
                {value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono uppercase">
                {label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Map at top ───────────────────────────────────────────────────── */}
      <div data-ocid="police-map-section">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle
            className="w-4 h-4"
            style={{ color: "oklch(var(--chart-3))" }}
          />
          <h2 className="text-sm font-display font-semibold text-foreground">
            Incident Map
          </h2>
          <span className="text-xs text-muted-foreground font-mono ml-1">
            {alertMarkerCount} active incident
            {alertMarkerCount !== 1 ? "s" : ""} plotted
          </span>
        </div>
        <SharedMap height="300px" />
        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
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
              className="w-4 h-4 rounded-full inline-block border-2"
              style={{
                background: "oklch(0.75 0.19 80)",
                borderColor: "oklch(0.65 0.22 40)",
              }}
            />
            Emergency alert
          </span>
        </div>
      </div>

      {/* ── Alerts section ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3" data-ocid="police-alerts-section">
        {/* Section header */}
        <div className="flex items-center gap-2 flex-wrap">
          <AlertTriangle
            className="w-4 h-4 shrink-0"
            style={{ color: "oklch(var(--chart-3))" }}
          />
          <h2 className="text-sm font-display font-semibold text-foreground">
            Dispatch Alerts
          </h2>
          {active.length > 0 && (
            <Badge
              variant="destructive"
              className="text-xs px-1.5 h-5"
              data-ocid="police-incident-count"
            >
              {active.length} active
            </Badge>
          )}
        </div>

        {/* Filter bar */}
        <fieldset
          className="flex items-center gap-2 flex-wrap border-0 p-0 m-0"
          aria-label="Alert filters"
          data-ocid="police-filter-bar"
        >
          {(
            [
              { key: "all", label: "All" },
              { key: "new", label: "New" },
              { key: "acknowledged", label: "Acknowledged" },
              { key: "dispatched", label: "Dispatched" },
              { key: "resolved", label: "Resolved" },
            ] as { key: FilterKey; label: string }[]
          ).map(({ key, label }) => (
            <FilterButton
              key={key}
              label={label}
              count={filterCounts[key]}
              active={activeFilter === key}
              onClick={() => setActiveFilter(key)}
              ocid={`police-filter-${key}`}
            />
          ))}
        </fieldset>

        {/* Alert list */}
        <div
          className="rounded-lg border border-border bg-card"
          data-ocid="police-alert-list"
        >
          {isLoading ? (
            <div className="p-3 flex flex-col gap-2">
              {["sk1", "sk2", "sk3"].map((k) => (
                <Skeleton key={k} className="h-32 rounded-md" />
              ))}
            </div>
          ) : filteredMessages.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 text-center gap-3 px-4"
              data-ocid="police-empty-state"
            >
              <CheckCircle2
                className="w-8 h-8"
                style={{ color: "oklch(var(--chart-1))" }}
              />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  No alerts
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activeFilter === "all"
                    ? "No emergency messages have been submitted yet."
                    : `No alerts matching the "${activeFilter}" filter.`}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 flex flex-col gap-2">
              {filteredMessages.map((msg) => (
                <PoliceAlertCard key={msg.id.toString()} msg={msg} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
