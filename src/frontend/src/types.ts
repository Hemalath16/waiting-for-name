export { SignalStatus, Urgency } from "./backend.d";
export type { TrafficSignalView } from "./backend.d";

// Extended EmergencyMessageView with operational fields added by frontend layer
export interface EmergencyMessageView {
  id: bigint;
  resolved: boolean;
  urgency: import("./backend.d").Urgency;
  message: string;
  timestamp: bigint;
  location: string;
  acknowledged: boolean;
  acknowledgedAt: bigint | null;
  response: string | null;
  respondedAt: bigint | null;
  dispatched: boolean;
  dispatchedAt: bigint | null;
}
