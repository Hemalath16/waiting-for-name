import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  MessageSquare,
  Send,
  ThumbsUp,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { SharedMap } from "../components/SharedMap";
import { StatusDot } from "../components/StatusDot";
import { UrgencyBadge } from "../components/UrgencyBadge";
import { useMapContext } from "../context/MapContext";
import type { MapMarker } from "../context/MapContext";
import {
  useAcknowledgeEmergencyMessage,
  useEmergencyMessages,
  useResolveEmergencyMessage,
  useRespondToEmergencyMessage,
} from "../hooks/use-emergency-messages";
import { useSignals, useUpdateSignalStatus } from "../hooks/use-signals";
import { SignalStatus, Urgency } from "../types";
import type { EmergencyMessageView, TrafficSignalView } from "../types";

// --- Signal Card ---
function SignalCard({ signal }: { signal: TrafficSignalView }) {
  const { mutate: updateStatus, isPending } = useUpdateSignalStatus();
  const otherStatuses = Object.values(SignalStatus).filter(
    (s) => s !== signal.status,
  );

  const handleUpdate = (status: SignalStatus) => {
    updateStatus(
      { id: signal.id, status },
      {
        onSuccess: (ok) => {
          if (ok)
            toast.success(
              `Signal ${signal.location} → ${status.toUpperCase()}`,
            );
          else toast.error("Update failed");
        },
      },
    );
  };

  return (
    <Card
      className="border-border transition-smooth hover:border-muted-foreground/30"
      data-ocid={`signal-card-${signal.id}`}
    >
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate font-mono">{signal.location}</span>
            </div>
            <p className="text-sm font-semibold text-foreground truncate">
              Signal #{signal.id.toString()}
            </p>
          </div>
          <StatusDot status={signal.status} showLabel />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {otherStatuses.map((s) => (
            <Button
              key={s}
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => handleUpdate(s)}
              data-ocid={`set-signal-${signal.id}-${s}`}
              className="text-xs h-7 px-2.5 gap-1"
            >
              <StatusDot status={s} />
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>
            {new Date(
              Number(signal.lastUpdated) / 1_000_000,
            ).toLocaleTimeString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Message Status Badge ---
function MessageStatusBadge({ msg }: { msg: EmergencyMessageView }) {
  let label: string;
  let colorClass: string;

  if (msg.resolved) {
    label = "RESOLVED";
    colorClass = "bg-chart-1/10 text-chart-1 border-chart-1/30";
  } else if (msg.dispatched) {
    label = "DISPATCHED";
    colorClass = "bg-primary/10 text-primary border-primary/30";
  } else if (msg.response) {
    label = "RESPONDED";
    colorClass = "bg-chart-2/10 text-chart-2 border-chart-2/30";
  } else if (msg.acknowledged) {
    label = "ACKNOWLEDGED";
    colorClass = "bg-muted text-muted-foreground border-border";
  } else {
    label = "NEW";
    colorClass = "bg-chart-3/10 text-chart-3 border-chart-3/40";
  }

  return (
    <span
      className={`inline-block font-mono text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded border ${colorClass}`}
      data-ocid={`msg-status-badge-${msg.id}`}
    >
      {label}
    </span>
  );
}

// --- Emergency Column Item ---
function EmergencyItem({ msg }: { msg: EmergencyMessageView }) {
  const { mutate: resolve, isPending: resolving } =
    useResolveEmergencyMessage();
  const { mutate: acknowledge, isPending: acknowledging } =
    useAcknowledgeEmergencyMessage();
  const { mutate: respond, isPending: responding } =
    useRespondToEmergencyMessage();

  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (showReplyForm) replyInputRef.current?.focus();
  }, [showReplyForm]);

  const borderColor =
    msg.urgency === Urgency.critical
      ? "oklch(var(--chart-3))"
      : msg.urgency === Urgency.high
        ? "oklch(var(--chart-2))"
        : "oklch(var(--chart-1))";

  const handleReply = () => {
    if (!replyText.trim()) return;
    respond(
      { id: msg.id, response: replyText.trim() },
      {
        onSuccess: () => {
          toast.success("Response sent");
          setReplyText("");
          setShowReplyForm(false);
        },
        onError: () => toast.error("Failed to send response"),
      },
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="emergency-card border-l-4"
      style={{ borderLeftColor: borderColor }}
      data-ocid={`emergency-col-item-${msg.id}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <UrgencyBadge urgency={msg.urgency} />
        <MessageStatusBadge msg={msg} />
      </div>

      {/* Message text */}
      <p className="text-sm text-foreground mb-2 leading-snug">{msg.message}</p>

      {/* Location + time */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <MapPin className="w-3 h-3 shrink-0" />
        <span className="truncate font-mono">{msg.location}</span>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
        <Clock className="w-3 h-3" />
        {new Date(Number(msg.timestamp) / 1_000_000).toLocaleTimeString()}
      </div>

      {/* Response text (if present) */}
      {msg.response && (
        <div
          className="mt-2 p-2 rounded bg-muted/60 border border-border text-xs text-muted-foreground"
          data-ocid={`emergency-response-${msg.id}`}
        >
          <span className="font-semibold text-foreground">Response: </span>
          {msg.response}
        </div>
      )}

      {/* Inline reply form */}
      {showReplyForm && !msg.resolved && (
        <div
          className="mt-2 flex flex-col gap-1.5"
          data-ocid={`reply-form-${msg.id}`}
        >
          <textarea
            ref={replyInputRef}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type a response..."
            rows={2}
            className="w-full text-xs rounded border border-input bg-background px-2 py-1.5 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleReply();
              }
            }}
            data-ocid={`reply-input-${msg.id}`}
          />
          <div className="flex gap-1.5">
            <Button
              size="sm"
              disabled={responding || !replyText.trim()}
              onClick={handleReply}
              data-ocid={`reply-submit-${msg.id}`}
              className="text-xs h-6 px-2 gap-1 flex-1"
            >
              <Send className="w-3 h-3" />
              Send
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowReplyForm(false);
                setReplyText("");
              }}
              data-ocid={`reply-cancel-${msg.id}`}
              className="text-xs h-6 px-2 text-muted-foreground"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Action buttons row */}
      {!msg.resolved && (
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {/* ACKNOWLEDGE */}
          {!msg.acknowledged ? (
            <Button
              size="sm"
              variant="outline"
              disabled={acknowledging}
              onClick={() =>
                acknowledge(msg.id, {
                  onSuccess: () => toast.success("Message acknowledged"),
                  onError: () => toast.error("Could not acknowledge"),
                })
              }
              data-ocid={`acknowledge-emergency-${msg.id}`}
              className="text-xs h-6 px-2 gap-1 border-chart-2/50 text-chart-2 hover:bg-chart-2/10"
            >
              <ThumbsUp className="w-3 h-3" />
              ACK
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-chart-2 font-mono">
              <CheckCircle2 className="w-3 h-3" />
              Acknowledged
            </span>
          )}

          {/* RESPOND */}
          {!showReplyForm && (
            <Button
              size="sm"
              variant="outline"
              disabled={responding}
              onClick={() => setShowReplyForm(true)}
              data-ocid={`respond-emergency-${msg.id}`}
              className="text-xs h-6 px-2 gap-1 border-primary/40 text-primary hover:bg-primary/10"
            >
              <MessageSquare className="w-3 h-3" />
              RESPOND
            </Button>
          )}

          {/* RESOLVE */}
          <Button
            size="sm"
            variant="ghost"
            disabled={resolving}
            onClick={() =>
              resolve(msg.id, {
                onSuccess: () => toast.success("Message resolved"),
              })
            }
            data-ocid={`resolve-emergency-col-${msg.id}`}
            className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground ml-auto"
          >
            Resolve
          </Button>
        </div>
      )}

      {msg.resolved && (
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <CheckCircle2
            className="w-3 h-3"
            style={{ color: "oklch(var(--chart-1))" }}
          />
          <span>Resolved</span>
        </div>
      )}
    </motion.div>
  );
}

// --- Stats Bar ---
function StatsBar({ signals }: { signals: TrafficSignalView[] }) {
  const red = signals.filter((s) => s.status === SignalStatus.red).length;
  const yellow = signals.filter((s) => s.status === SignalStatus.yellow).length;
  const green = signals.filter((s) => s.status === SignalStatus.green).length;

  const stats = [
    { label: "Total", value: signals.length, color: "text-foreground" },
    { label: "Red", value: red, color: "text-chart-3" },
    { label: "Yellow", value: yellow, color: "text-chart-2" },
    { label: "Green", value: green, color: "text-chart-1" },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {stats.map(({ label, value, color }) => (
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
  );
}

// --- Signal Markers Sync ---
function SignalMarkerSync({ signals }: { signals: TrafficSignalView[] }) {
  const { setSignalMarkers } = useMapContext();

  useEffect(() => {
    if (!signals.length) return;
    // Build deterministic lat/lng from signal id for demo (real data would have coordinates)
    const BASE_LAT = 51.5074;
    const BASE_LNG = -0.1278;
    const markers: MapMarker[] = signals.map((s, i) => {
      // Spread signals around central London in a grid-like pattern
      const row = Math.floor(i / 3);
      const col = i % 3;
      return {
        id: `signal-${s.id.toString()}`,
        lat: BASE_LAT + (row - 1) * 0.012 + (col - 1) * 0.005,
        lng: BASE_LNG + (col - 1) * 0.018 + (row - 1) * 0.004,
        type: "signal",
        label: s.location,
        status: s.status,
      };
    });
    setSignalMarkers(markers);
  }, [signals, setSignalMarkers]);

  return null;
}

// --- Main ControlPanel ---
export function ControlPanel() {
  const { data: signals = [], isLoading: signalsLoading } = useSignals();
  const { data: messages = [], isLoading: msgsLoading } =
    useEmergencyMessages();

  const activeEmergencies = messages.filter((m) => !m.resolved);
  const criticalHighCount = activeEmergencies.filter(
    (m) => m.urgency === Urgency.critical || m.urgency === Urgency.high,
  ).length;
  const sortedEmergencies = [...activeEmergencies].sort((a, b) => {
    const order: Record<string, number> = { critical: 0, high: 1, normal: 2 };
    return (order[a.urgency] ?? 2) - (order[b.urgency] ?? 2);
  });

  return (
    <div
      className="max-w-screen-2xl mx-auto px-4 py-6 grid gap-6"
      style={{ gridTemplateColumns: "1fr 340px" }}
      data-ocid="control-panel"
    >
      {/* Sync signal markers to shared map context */}
      {!signalsLoading && <SignalMarkerSync signals={signals} />}

      {/* LEFT: Signals + Map */}
      <section className="min-w-0 flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <Activity
            className="w-5 h-5"
            style={{ color: "oklch(var(--primary))" }}
          />
          <h2 className="text-lg font-display font-semibold text-foreground">
            Signal Control
          </h2>
          <Badge variant="outline" className="ml-auto text-xs font-mono">
            Live · 3s
          </Badge>
        </div>

        {signalsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"].map((k) => (
              <Skeleton key={k} className="h-32 rounded-lg" />
            ))}
          </div>
        ) : signals.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-xl text-center gap-3"
            data-ocid="signals-empty-state"
          >
            <Zap className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No traffic signals found
            </p>
          </div>
        ) : (
          <>
            <StatsBar signals={signals} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {signals.map((signal, i) => (
                <motion.div
                  key={signal.id.toString()}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <SignalCard signal={signal} />
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Map: shows all signal locations */}
        <div
          className="flex flex-col gap-2"
          data-ocid="control-panel-map-section"
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">
              Signal Map
            </h3>
            <span className="text-xs text-muted-foreground font-mono ml-auto">
              Live signal locations
            </span>
          </div>
          <SharedMap height="250px" />
        </div>
      </section>

      {/* RIGHT: Emergency Messages Column */}
      <aside
        className="flex flex-col gap-4 min-w-0"
        data-ocid="emergency-sidebar-column"
      >
        <div className="sticky top-[3.75rem] flex flex-col gap-3 max-h-[calc(100vh-5.5rem)] overflow-hidden">
          {/* Sidebar Header with prominent notification badge */}
          <div
            className="flex items-center gap-2 shrink-0 p-2.5 rounded-lg border border-border bg-card relative"
            data-ocid="emergency-sidebar-header"
          >
            <AlertTriangle
              className="w-4 h-4"
              style={{ color: "oklch(var(--chart-3))" }}
            />
            <h2 className="text-sm font-display font-semibold text-foreground">
              Emergency Messages
            </h2>

            {/* Pulsing critical/high count badge */}
            {criticalHighCount > 0 && (
              <div
                className="ml-auto relative"
                data-ocid="emergency-critical-badge"
              >
                <span className="absolute inset-0 rounded-full bg-chart-3 opacity-40 animate-ping" />
                <Badge
                  variant="destructive"
                  className="relative text-xs px-2 h-6 font-mono font-bold shadow-md"
                  data-ocid="emergency-critical-badge-count"
                >
                  {criticalHighCount} URGENT
                </Badge>
              </div>
            )}

            {/* Total active count (when no critical) */}
            {criticalHighCount === 0 && activeEmergencies.length > 0 && (
              <Badge
                variant="outline"
                className="ml-auto text-xs px-1.5 h-5"
                data-ocid="emergency-sidebar-count"
              >
                {activeEmergencies.length}
              </Badge>
            )}
          </div>

          <div
            className="rounded-lg border border-border overflow-y-auto flex-1"
            style={{ backgroundColor: "oklch(var(--card))" }}
            data-ocid="emergency-sidebar-list"
          >
            {msgsLoading ? (
              <div className="p-3 flex flex-col gap-2">
                {["sk1", "sk2", "sk3"].map((k) => (
                  <Skeleton key={k} className="h-24 rounded-md" />
                ))}
              </div>
            ) : sortedEmergencies.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-12 text-center gap-2 px-4"
                data-ocid="emergency-sidebar-empty"
              >
                <CheckCircle2
                  className="w-6 h-6"
                  style={{ color: "oklch(var(--chart-1))" }}
                />
                <p className="text-sm text-muted-foreground">All clear</p>
                <p className="text-xs text-muted-foreground">
                  No active emergencies
                </p>
              </div>
            ) : (
              <div className="p-3 flex flex-col gap-2">
                {sortedEmergencies.map((msg) => (
                  <EmergencyItem key={msg.id.toString()} msg={msg} />
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center shrink-0 font-mono">
            Auto-refresh every 3s
          </p>
        </div>
      </aside>
    </div>
  );
}
