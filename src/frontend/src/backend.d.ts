import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TrafficSignalView {
    id: bigint;
    status: SignalStatus;
    lastUpdated: bigint;
    location: string;
}
export interface EmergencyMessageView {
    id: bigint;
    resolved: boolean;
    acknowledgedAt?: bigint;
    urgency: Urgency;
    dispatched: boolean;
    dispatchedAt?: bigint;
    acknowledged: boolean;
    message: string;
    response?: string;
    timestamp: bigint;
    respondedAt?: bigint;
    location: string;
}
export enum SignalStatus {
    red = "red",
    green = "green",
    yellow = "yellow"
}
export enum Urgency {
    normal = "normal",
    high = "high",
    critical = "critical"
}
export interface backendInterface {
    acknowledgeEmergencyMessage(id: bigint): Promise<boolean>;
    dispatchEmergencyMessage(id: bigint): Promise<boolean>;
    getSignal(id: bigint): Promise<TrafficSignalView | null>;
    listEmergencyMessages(): Promise<Array<EmergencyMessageView>>;
    listSignals(): Promise<Array<TrafficSignalView>>;
    resolveEmergencyMessage(id: bigint): Promise<boolean>;
    respondToEmergencyMessage(id: bigint, response: string): Promise<boolean>;
    submitEmergencyMessage(message: string, urgency: Urgency, location: string): Promise<bigint>;
    unresolvedEmergencyCount(): Promise<bigint>;
    updateSignalStatus(id: bigint, status: SignalStatus): Promise<boolean>;
}
