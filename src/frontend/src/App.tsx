import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Radio, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { Layout } from "./components/Layout";
import { MapProvider } from "./context/MapContext";

import { ControlPanel } from "./pages/ControlPanel";
import { EmergencyPanel } from "./pages/EmergencyPanel";
import { TrafficPolice } from "./pages/TrafficPolice";
import { TrafficUser } from "./pages/TrafficUser";

export type Tab =
  | "control-panel"
  | "emergency-panel"
  | "traffic-user"
  | "traffic-police";

function getTabFromUrl(): Tab {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get("tab");
  if (tab === "emergency-panel") return "emergency-panel";
  if (tab === "traffic-user") return "traffic-user";
  if (tab === "traffic-police") return "traffic-police";
  return "control-panel";
}

function setTabInUrl(tab: Tab) {
  const url = new URL(window.location.href);
  url.searchParams.set("tab", tab);
  window.history.pushState({}, "", url.toString());
}

export default function App() {
  const { isInitializing, identity, login } = useInternetIdentity();

  const [activeTab, setActiveTab] = useState<Tab>(getTabFromUrl);

  useEffect(() => {
    const onPop = () => setActiveTab(getTabFromUrl());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setTabInUrl(tab);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-md" />
          <Skeleton className="w-32 h-4 rounded" />
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center"
        data-ocid="login-screen"
      >
        <div
          className="w-full max-w-sm p-8 rounded-xl border border-border flex flex-col items-center gap-6 shadow-lg"
          style={{ backgroundColor: "oklch(var(--card))" }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="flex items-center justify-center w-14 h-14 rounded-xl"
              style={{
                backgroundColor: "oklch(var(--primary) / 0.12)",
                border: "1px solid oklch(var(--primary) / 0.35)",
              }}
            >
              <Radio
                className="w-7 h-7"
                style={{ color: "oklch(var(--primary))" }}
              />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">
                Traffic
                <span style={{ color: "oklch(var(--primary))" }}>AI</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Traffic Control Operations Center
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full border-t border-border" />

          {/* Features */}
          <div className="w-full space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: "oklch(var(--chart-1))" }}
              />
              Real-time signal monitoring
            </div>
            <div className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: "oklch(var(--chart-3))" }}
              />
              Emergency message dispatch
            </div>
            <div className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: "oklch(var(--primary))" }}
              />
              Secure Internet Identity login
            </div>
          </div>

          {/* CTA */}
          <Button
            className="w-full gap-2 font-semibold"
            onClick={login}
            data-ocid="login-button"
          >
            <ShieldAlert className="w-4 h-4" />
            Sign in with Internet Identity
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Authorized personnel only
          </p>
        </div>
      </div>
    );
  }

  return (
    <MapProvider>
      <Layout activeTab={activeTab} onTabChange={handleTabChange}>
        {activeTab === "control-panel" && <ControlPanel />}
        {activeTab === "emergency-panel" && <EmergencyPanel />}
        {activeTab === "traffic-user" && <TrafficUser />}
        {activeTab === "traffic-police" && <TrafficPolice />}
      </Layout>
    </MapProvider>
  );
}
