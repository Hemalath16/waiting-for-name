import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  Bell,
  BellOff,
  CheckCircle2,
  Clock,
  Inbox,
  MapPin,
  MessageSquare,
  Send,
  Truck,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SharedMap } from "../components/SharedMap";
import { UrgencyBadge } from "../components/UrgencyBadge";
import { useMapContext } from "../context/MapContext";
import type { MapMarker } from "../context/MapContext";
import {
  useAcknowledgeEmergencyMessage,
  useEmergencyMessages,
  useResolveEmergencyMessage,
  useSubmitEmergencyMessage,
} from "../hooks/use-emergency-messages";
import { Urgency } from "../types";
import type { EmergencyMessageView } from "../types";

// --- Map marker sync for emergency alerts ---
function useEmergencyMapMarkers(messages: EmergencyMessageView[]) {
  const { setAlertMarkers } = useMapContext();

  useEffect(() => {
    const markers: MapMarker[] = messages
      .filter((m) => !m.resolved)
      .map((m) => ({
        id: `emergency-${m.id.toString()}`,
        lat:
          51.5074 + (Number.parseFloat(m.id.toString()) % 10) * 0.003 - 0.015,
        lng: -0.1278 + (Number.parseFloat(m.id.toString()) % 7) * 0.004 - 0.014,
        type: "alert" as const,
        label: m.message.slice(0, 40) + (m.message.length > 40 ? "…" : ""),
        urgency: m.urgency,
      }));

    setAlertMarkers(markers);
  }, [messages, setAlertMarkers]);
}

// --- Status label helper ---
function getStatusLabel(msg: EmergencyMessageView): {
  label: string;
  icon: React.ReactNode;
  className: string;
} {
  if (msg.resolved)
    return {
      label: "RESOLVED",
      icon: <CheckCircle2 className="w-3 h-3" />,
      className: "text-chart-1",
    };
  if (msg.dispatched)
    return {
      label: "DISPATCHED",
      icon: <Truck className="w-3 h-3" />,
      className: "text-primary",
    };
  if (msg.response)
    return {
      label: "RESPONDED",
      icon: <MessageSquare className="w-3 h-3" />,
      className: "text-chart-2",
    };
  if (msg.acknowledged)
    return {
      label: "ACKNOWLEDGED",
      icon: <Bell className="w-3 h-3" />,
      className: "text-chart-2",
    };
  return {
    label: "NEW",
    icon: <BellOff className="w-3 h-3" />,
    className: "text-muted-foreground",
  };
}

// --- Emergency Message Row ---
function EmergencyRow({ msg }: { msg: EmergencyMessageView }) {
  const { mutate: resolve, isPending: isResolving } =
    useResolveEmergencyMessage();
  const { mutate: acknowledge, isPending: isAcknowledging } =
    useAcknowledgeEmergencyMessage();

  const borderColor =
    msg.urgency === Urgency.critical
      ? "oklch(var(--chart-3))"
      : msg.urgency === Urgency.high
        ? "oklch(var(--chart-2))"
        : "oklch(var(--chart-1))";

  const status = getStatusLabel(msg);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="emergency-card border-l-4"
      style={{ borderLeftColor: borderColor }}
      data-ocid={`emergency-row-${msg.id}`}
    >
      {/* Header row: urgency + status + actions */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <UrgencyBadge urgency={msg.urgency} />

          {/* Status label */}
          <span
            className={`flex items-center gap-1 text-xs font-semibold tracking-wide ${status.className}`}
            data-ocid={`status-label-${msg.id}`}
          >
            {status.icon}
            {status.label}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Acknowledge — show only if active and not yet acknowledged */}
          {!msg.resolved && !msg.acknowledged && (
            <Button
              size="sm"
              variant="outline"
              disabled={isAcknowledging}
              onClick={() =>
                acknowledge(msg.id, {
                  onSuccess: () => toast.success("Message acknowledged"),
                  onError: () => toast.error("Could not acknowledge message"),
                })
              }
              data-ocid={`acknowledge-emergency-${msg.id}`}
              className="text-xs h-7 px-3"
            >
              <Bell className="w-3 h-3 mr-1" />
              Acknowledge
            </Button>
          )}

          {/* Resolve — show only if not yet resolved */}
          {!msg.resolved && (
            <Button
              size="sm"
              variant="outline"
              disabled={isResolving}
              onClick={() =>
                resolve(msg.id, {
                  onSuccess: () => toast.success("Emergency message resolved"),
                })
              }
              data-ocid={`resolve-emergency-${msg.id}`}
              className="text-xs h-7 px-3"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Resolve
            </Button>
          )}
        </div>
      </div>

      {/* Message text */}
      <p className="text-sm text-foreground leading-relaxed mb-2">
        {msg.message}
      </p>

      {/* Response block */}
      {msg.response && (
        <blockquote
          className="border-l-2 border-muted-foreground/40 pl-3 py-1 mb-2 bg-muted/40 rounded-r-md"
          data-ocid={`response-block-${msg.id}`}
        >
          <p className="text-xs text-muted-foreground font-medium mb-0.5 uppercase tracking-wide">
            Response
          </p>
          <p className="text-sm text-foreground/80 italic leading-relaxed">
            {msg.response}
          </p>
          {msg.respondedAt && (
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(Number(msg.respondedAt) / 1_000_000).toLocaleString()}
            </p>
          )}
        </blockquote>
      )}

      {/* Footer: location + timestamp */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span className="font-mono">{msg.location}</span>
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(Number(msg.timestamp) / 1_000_000).toLocaleString()}
        </span>
      </div>
    </motion.div>
  );
}

// --- Submit Form ---
function SubmitEmergencyForm() {
  const [message, setMessage] = useState("");
  const [location, setLocation] = useState("");
  const [urgency, setUrgency] = useState<Urgency>(Urgency.normal);
  const { mutate: submit, isPending } = useSubmitEmergencyMessage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !location.trim()) {
      toast.error("Message and location are required");
      return;
    }
    submit(
      { message: message.trim(), urgency, location: location.trim() },
      {
        onSuccess: () => {
          toast.success("Emergency message submitted");
          setMessage("");
          setLocation("");
          setUrgency(Urgency.normal);
        },
        onError: () => toast.error("Failed to submit message"),
      },
    );
  };

  return (
    <Card className="border-border" data-ocid="submit-emergency-form">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 font-display">
          <Send
            className="w-4 h-4"
            style={{ color: "oklch(var(--chart-3))" }}
          />
          Submit Emergency Message
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="em-location" className="text-xs">
                Location
              </Label>
              <Input
                id="em-location"
                placeholder="e.g. Main St & 5th Ave"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                data-ocid="emergency-location-input"
                className="text-sm h-9"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="em-urgency" className="text-xs">
                Urgency
              </Label>
              <Select
                value={urgency}
                onValueChange={(v) => setUrgency(v as Urgency)}
                data-ocid="emergency-urgency-select"
              >
                <SelectTrigger id="em-urgency" className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Urgency.normal}>Normal</SelectItem>
                  <SelectItem value={Urgency.high}>High</SelectItem>
                  <SelectItem value={Urgency.critical}>Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="em-message" className="text-xs">
              Message
            </Label>
            <Textarea
              id="em-message"
              placeholder="Describe the emergency situation..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              data-ocid="emergency-message-input"
              rows={3}
              className="text-sm resize-none"
            />
          </div>
          <Button
            type="submit"
            disabled={isPending || !message.trim() || !location.trim()}
            data-ocid="submit-emergency-button"
            className="gap-2 font-semibold"
          >
            <AlertTriangle className="w-4 h-4" />
            {isPending ? "Submitting..." : "Submit Emergency"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// --- Main EmergencyPanel ---
export function EmergencyPanel() {
  const { data: messages = [], isLoading } = useEmergencyMessages();
  const [showResolved, setShowResolved] = useState(false);

  // Sync active emergency messages as map markers
  useEmergencyMapMarkers(messages);

  const active = messages.filter((m) => !m.resolved);
  const resolved = messages.filter((m) => m.resolved);

  const displayed = showResolved ? resolved : active;
  const sortedDisplayed = [...displayed].sort((a, b) => {
    if (!showResolved) {
      const order: Record<string, number> = { critical: 0, high: 1, normal: 2 };
      return (order[a.urgency] ?? 2) - (order[b.urgency] ?? 2);
    }
    return Number(b.timestamp - a.timestamp);
  });

  return (
    <div
      className="max-w-screen-xl mx-auto px-4 py-6 flex flex-col gap-6"
      data-ocid="emergency-panel"
    >
      {/* Live map: shows all active emergency alert locations */}
      <Card className="overflow-hidden border-border">
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="text-sm font-display font-semibold flex items-center gap-2 text-muted-foreground">
            <MapPin
              className="w-4 h-4"
              style={{ color: "oklch(var(--chart-3))" }}
            />
            Emergency Alert Locations
            <Badge variant="outline" className="text-xs font-mono ml-auto">
              Live · 3s
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <SharedMap height="250px" />
        </CardContent>
      </Card>

      <SubmitEmergencyForm />

      <Separator />

      {/* Filter bar */}
      <div className="flex items-center gap-3" data-ocid="emergency-filter-bar">
        <h2 className="text-base font-display font-semibold text-foreground flex items-center gap-2">
          <Inbox className="w-4 h-4 text-muted-foreground" />
          Messages
        </h2>
        <div className="flex items-center gap-1.5 ml-auto">
          <Button
            type="button"
            size="sm"
            variant={!showResolved ? "default" : "outline"}
            onClick={() => setShowResolved(false)}
            data-ocid="filter-active-messages"
            className="h-7 px-3 text-xs gap-1.5"
          >
            Active
            {active.length > 0 && (
              <Badge
                variant="destructive"
                className="text-xs px-1.5 h-4 ml-0.5"
              >
                {active.length}
              </Badge>
            )}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={showResolved ? "default" : "outline"}
            onClick={() => setShowResolved(true)}
            data-ocid="filter-resolved-messages"
            className="h-7 px-3 text-xs"
          >
            Resolved ({resolved.length})
          </Button>
        </div>
      </div>

      {/* Message list */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {["sk1", "sk2", "sk3", "sk4"].map((k) => (
            <Skeleton key={k} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : sortedDisplayed.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-xl text-center gap-3"
          data-ocid="emergency-empty-state"
        >
          <CheckCircle2
            className="w-10 h-10"
            style={{ color: "oklch(var(--chart-1))" }}
          />
          <p className="text-base font-semibold text-foreground">
            {showResolved ? "No resolved messages" : "No active emergencies"}
          </p>
          <p className="text-sm text-muted-foreground">
            {showResolved
              ? "Resolved messages will appear here"
              : "All emergencies have been resolved"}
          </p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="flex flex-col gap-3">
            {sortedDisplayed.map((msg) => (
              <EmergencyRow key={msg.id.toString()} msg={msg} />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
