import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";
import { useMapContext } from "../context/MapContext";
import type { MapMarker } from "../context/MapContext";

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// NOTE: Leaflet divIcon renders HTML strings — CSS custom properties are not
// available in that context, so we use literal OKLCH hex-equivalent values here.
// These are the only raw color literals permitted in this codebase.
const SIGNAL_COLORS: Record<string, string> = {
  red: "#ef4444",
  yellow: "#eab308",
  green: "#22c55e",
  unknown: "#94a3b8",
};

const ALERT_COLORS: Record<string, string> = {
  critical: "#f97316",
  high: "#eab308",
  normal: "#3b82f6",
};

function getSignalColor(status?: string): string {
  return SIGNAL_COLORS[status ?? ""] ?? SIGNAL_COLORS.unknown;
}

function getAlertColor(urgency?: string): string {
  return ALERT_COLORS[urgency ?? ""] ?? ALERT_COLORS.normal;
}

function createCircleIcon(color: string, isAlert: boolean): L.DivIcon {
  const size = isAlert ? 18 : 14;
  const border = isAlert
    ? "3px solid rgba(255,255,255,0.8)"
    : "2px solid rgba(255,255,255,0.6)";
  const shadow = isAlert
    ? "0 0 8px rgba(249,115,22,0.6)"
    : "0 0 4px rgba(0,0,0,0.4)";
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50%;border:${border};box-shadow:${shadow};"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  });
}

function addLeafletMarker(
  map: L.Map,
  marker: MapMarker,
  collection: L.Marker[],
) {
  const isAlert = marker.type === "alert";
  const color = isAlert
    ? getAlertColor(marker.urgency)
    : getSignalColor(marker.status);
  const icon = createCircleIcon(color, isAlert);

  const statusLine = isAlert
    ? `<span style="color:${color};font-weight:600;text-transform:uppercase;font-size:11px;">${marker.urgency ?? "alert"}</span>`
    : `<span style="color:${color};font-weight:600;text-transform:uppercase;font-size:11px;">${marker.status ?? "unknown"}</span>`;

  const popupHtml = `
    <div style="font-family:sans-serif;min-width:140px;">
      <div style="font-size:12px;font-weight:600;color:#1e293b;margin-bottom:4px;">${marker.label}</div>
      <div style="font-size:11px;color:#64748b;margin-bottom:2px;">${isAlert ? "🚨 Emergency Alert" : "🚦 Traffic Signal"}</div>
      ${statusLine}
    </div>
  `;

  const leafletMarker = L.marker([marker.lat, marker.lng], { icon })
    .addTo(map)
    .bindPopup(popupHtml);

  collection.push(leafletMarker);
}

interface SharedMapProps {
  height?: number | string;
}

export function SharedMap({ height = 300 }: SharedMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const initializedRef = useRef(false);
  const { center, zoom, markers } = useMapContext();

  // Full effect: create or update map based on all dependencies
  useEffect(() => {
    if (!containerRef.current) return;

    // Create map on first run
    if (!initializedRef.current) {
      initializedRef.current = true;
      const map = L.map(containerRef.current, {
        center: [center.lat, center.lng],
        zoom,
        zoomControl: true,
        attributionControl: true,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;
    } else if (mapRef.current) {
      // Pan/zoom on subsequent runs
      mapRef.current.setView([center.lat, center.lng], zoom, { animate: true });
    }

    // Refresh markers
    const map = mapRef.current;
    if (map) {
      for (const m of markersRef.current) m.remove();
      markersRef.current = [];
      for (const marker of markers) {
        addLeafletMarker(map, marker, markersRef.current);
      }
    }
  }, [center.lat, center.lng, zoom, markers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        initializedRef.current = false;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        height: typeof height === "number" ? `${height}px` : height,
        width: "100%",
      }}
      className="rounded-lg overflow-hidden border border-border"
      data-ocid="shared-map"
    />
  );
}
