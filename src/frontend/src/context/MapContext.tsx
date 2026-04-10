import { createContext, useContext, useMemo, useState } from "react";
import type { SignalStatus, Urgency } from "../types";

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  type: "signal" | "alert";
  label: string;
  status?: SignalStatus;
  urgency?: Urgency;
}

export interface MapCenter {
  lat: number;
  lng: number;
}

interface MapContextValue {
  center: MapCenter;
  zoom: number;
  markers: MapMarker[];
  signalMarkers: MapMarker[];
  alertMarkers: MapMarker[];
  setCenter: (center: MapCenter) => void;
  setZoom: (zoom: number) => void;
  setSignalMarkers: (markers: MapMarker[]) => void;
  setAlertMarkers: (markers: MapMarker[]) => void;
}

const MapContext = createContext<MapContextValue | null>(null);

// London coordinates as default city center
const DEFAULT_CENTER: MapCenter = { lat: 51.5074, lng: -0.1278 };
const DEFAULT_ZOOM = 13;

// Demo signal markers spread around central London
const DEFAULT_SIGNAL_MARKERS: MapMarker[] = [
  {
    id: "signal-0",
    lat: 51.5155,
    lng: -0.1415,
    type: "signal",
    label: "Main St & 1st Ave",
    status: "green" as SignalStatus,
  },
  {
    id: "signal-1",
    lat: 51.5085,
    lng: -0.128,
    type: "signal",
    label: "Broadway & 5th St",
    status: "green" as SignalStatus,
  },
  {
    id: "signal-2",
    lat: 51.504,
    lng: -0.134,
    type: "signal",
    label: "Oak Ave & Park Blvd",
    status: "yellow" as SignalStatus,
  },
  {
    id: "signal-3",
    lat: 51.499,
    lng: -0.12,
    type: "signal",
    label: "Elm St & Central Dr",
    status: "red" as SignalStatus,
  },
  {
    id: "signal-4",
    lat: 51.52,
    lng: -0.11,
    type: "signal",
    label: "Highway 101 & Exit 4",
    status: "green" as SignalStatus,
  },
  {
    id: "signal-5",
    lat: 51.478,
    lng: -0.453,
    type: "signal",
    label: "Airport Rd & Terminal 1",
    status: "green" as SignalStatus,
  },
];

// Demo alert markers spread around central London
const DEFAULT_ALERT_MARKERS: MapMarker[] = [
  {
    id: "alert-1",
    lat: 51.4985,
    lng: -0.1198,
    type: "alert",
    label: "Signal malfunction — vehicles at risk",
    urgency: "critical" as Urgency,
  },
  {
    id: "alert-2",
    lat: 51.5038,
    lng: -0.1337,
    type: "alert",
    label: "Amber signal stuck 20+ mins",
    urgency: "high" as Urgency,
  },
];

export function MapProvider({ children }: { children: React.ReactNode }) {
  const [center, setCenter] = useState<MapCenter>(DEFAULT_CENTER);
  const [zoom, setZoom] = useState<number>(DEFAULT_ZOOM);
  const [signalMarkers, setSignalMarkers] = useState<MapMarker[]>(
    DEFAULT_SIGNAL_MARKERS,
  );
  const [alertMarkers, setAlertMarkers] = useState<MapMarker[]>(
    DEFAULT_ALERT_MARKERS,
  );

  // Computed combined markers for the map to render
  const markers = useMemo(
    () => [...signalMarkers, ...alertMarkers],
    [signalMarkers, alertMarkers],
  );

  return (
    <MapContext.Provider
      value={{
        center,
        zoom,
        markers,
        signalMarkers,
        alertMarkers,
        setCenter,
        setZoom,
        setSignalMarkers,
        setAlertMarkers,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}

export function useMapContext() {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error("useMapContext must be used inside MapProvider");
  return ctx;
}
