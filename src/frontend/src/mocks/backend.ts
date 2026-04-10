import type { EmergencyMessageView as BaseEmergencyMessageView, backendInterface as BaseBackendInterface } from "../backend";
import { SignalStatus, Urgency } from "../backend";

// Extended EmergencyMessageView with new operational fields
export interface ExtendedEmergencyMessageView extends BaseEmergencyMessageView {
  acknowledged: boolean;
  acknowledgedAt: bigint | null;
  response: string | null;
  respondedAt: bigint | null;
  dispatched: boolean;
  dispatchedAt: bigint | null;
}

// Extended backend interface with new methods
interface ExtendedBackendInterface extends BaseBackendInterface {
  listEmergencyMessages(): Promise<Array<ExtendedEmergencyMessageView>>;
  acknowledgeEmergencyMessage(id: bigint): Promise<boolean>;
  respondToEmergencyMessage(id: bigint, response: string): Promise<boolean>;
  dispatchEmergencyMessage(id: bigint): Promise<boolean>;
}

export const mockBackend: ExtendedBackendInterface = {
  listSignals: async () => [
    { id: BigInt(0), status: SignalStatus.green, lastUpdated: BigInt(Date.now()), location: "Main St & 1st Ave" },
    { id: BigInt(1), status: SignalStatus.green, lastUpdated: BigInt(Date.now()), location: "Broadway & 5th St" },
    { id: BigInt(2), status: SignalStatus.yellow, lastUpdated: BigInt(Date.now()), location: "Oak Ave & Park Blvd" },
    { id: BigInt(3), status: SignalStatus.red, lastUpdated: BigInt(Date.now()), location: "Elm St & Central Dr" },
    { id: BigInt(4), status: SignalStatus.green, lastUpdated: BigInt(Date.now()), location: "Highway 101 & Exit 4" },
    { id: BigInt(5), status: SignalStatus.green, lastUpdated: BigInt(Date.now()), location: "Airport Rd & Terminal 1" },
  ],
  getSignal: async (id) => ({
    id,
    status: SignalStatus.green,
    lastUpdated: BigInt(Date.now()),
    location: "Main St & 1st Ave",
  }),
  listEmergencyMessages: async () => [
    {
      id: BigInt(1),
      resolved: false,
      urgency: Urgency.critical,
      message: "Signal malfunction at Elm St & Central Dr — vehicles at risk",
      timestamp: BigInt(Date.now() - 300000),
      location: "Elm St & Central Dr",
      acknowledged: false,
      acknowledgedAt: null,
      response: null,
      respondedAt: null,
      dispatched: false,
      dispatchedAt: null,
    },
    {
      id: BigInt(2),
      resolved: false,
      urgency: Urgency.high,
      message: "Amber signal stuck for 20+ minutes on Oak Ave",
      timestamp: BigInt(Date.now() - 900000),
      location: "Oak Ave & Park Blvd",
      acknowledged: true,
      acknowledgedAt: BigInt(Date.now() - 600000),
      response: null,
      respondedAt: null,
      dispatched: false,
      dispatchedAt: null,
    },
    {
      id: BigInt(3),
      resolved: false,
      urgency: Urgency.normal,
      message: "Routine inspection needed at Airport Rd",
      timestamp: BigInt(Date.now() - 3600000),
      location: "Airport Rd & Terminal 1",
      acknowledged: true,
      acknowledgedAt: BigInt(Date.now() - 3000000),
      response: "Unit dispatched for inspection",
      respondedAt: BigInt(Date.now() - 2800000),
      dispatched: true,
      dispatchedAt: BigInt(Date.now() - 2700000),
    },
  ],
  resolveEmergencyMessage: async (_id) => true,
  submitEmergencyMessage: async (_message, _urgency, _location) => BigInt(4),
  unresolvedEmergencyCount: async () => BigInt(2),
  updateSignalStatus: async (_id, _status) => true,
  acknowledgeEmergencyMessage: async (_id) => true,
  respondToEmergencyMessage: async (_id, _response) => true,
  dispatchEmergencyMessage: async (_id) => true,
};
