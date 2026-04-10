import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { AlertTriangle, Car, LogOut, Radio, Shield } from "lucide-react";
import type { Tab } from "../App";
import { useEmergencyMessages } from "../hooks/use-emergency-messages";

interface LayoutProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  children: React.ReactNode;
}

export function Layout({ activeTab, onTabChange, children }: LayoutProps) {
  const { clear, identity } = useInternetIdentity();
  const { data: messages = [] } = useEmergencyMessages();

  // Count critical/high unresolved alerts for notification badge
  const criticalHighCount = messages.filter(
    (m) => !m.resolved && (m.urgency === "critical" || m.urgency === "high"),
  ).length;

  const tabs = [
    { id: "control-panel" as Tab, label: "Control Panel", icon: null },
    {
      id: "emergency-panel" as Tab,
      label: "Emergency Panel",
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      badge: criticalHighCount,
    },
    {
      id: "traffic-user" as Tab,
      label: "Traffic User",
      icon: <Car className="w-3.5 h-3.5" />,
    },
    {
      id: "traffic-police" as Tab,
      label: "Traffic Police",
      icon: <Shield className="w-3.5 h-3.5" />,
    },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b border-border"
        style={{ backgroundColor: "oklch(var(--card))" }}
        data-ocid="main-header"
      >
        <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-md"
              style={{
                backgroundColor: "oklch(var(--primary) / 0.15)",
                border: "1px solid oklch(var(--primary) / 0.4)",
              }}
            >
              <Radio
                className="w-4 h-4"
                style={{ color: "oklch(var(--primary))" }}
              />
            </div>
            <span className="text-base font-display font-bold tracking-tight text-foreground">
              Traffic<span style={{ color: "oklch(var(--primary))" }}>AI</span>
            </span>
          </div>

          {/* Tab Navigation */}
          <nav className="flex items-center gap-0.5" data-ocid="tab-navigation">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const isEmergency = tab.id === "emergency-panel";

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  data-ocid={`tab-${tab.id}`}
                  className={[
                    "relative px-3 py-1.5 rounded-md text-sm font-medium transition-smooth flex items-center gap-1.5",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                  style={
                    isActive
                      ? {
                          backgroundColor: isEmergency
                            ? "oklch(var(--chart-3) / 0.12)"
                            : "oklch(var(--primary) / 0.12)",
                          color: isEmergency
                            ? "oklch(var(--chart-3))"
                            : "oklch(var(--primary))",
                        }
                      : {}
                  }
                >
                  {tab.icon}
                  {tab.label}
                  {"badge" in tab && tab.badge > 0 && (
                    <Badge
                      variant="destructive"
                      className="text-xs px-1.5 py-0 h-5 min-w-5 flex items-center justify-center pulse-badge"
                      data-ocid={`${tab.id}-count-badge`}
                    >
                      {tab.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {!!identity && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clear}
                data-ocid="logout-button"
                className="text-muted-foreground hover:text-foreground gap-1.5 text-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 bg-background" data-ocid="main-content">
        {children}
      </main>

      {/* Footer */}
      <footer
        className="border-t border-border py-3 px-4 text-center text-xs text-muted-foreground"
        style={{ backgroundColor: "oklch(var(--card) / 0.5)" }}
      >
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
            typeof window !== "undefined" ? window.location.hostname : "",
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
