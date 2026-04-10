# Design Brief

## Purpose & Context
TrafficAI dashboard for 24/7 traffic control operations with four role-based tabs (Control Panel, Emergency Panel, Traffic User, Traffic Police). Dark mode, high-contrast, industrial aesthetic. Four-tab layout: each with signal grid + shared interactive map. Emergency alerts with acknowledgment/response workflow.

## Visual Direction & Tone
Industrial/utilitarian with traffic-signal semantics. Grid-based, minimal decoration, high information density. Purpose-built for urgent response scenarios with clear action affordances. No playful elements—professional, serious, focused.

## Differentiation
Semantic color mapping to traffic signals: red=critical, yellow=warning, green=success, cyan=primary action. Notification badges pulse on tab header for unread critical/high alerts. Emergency messages feature action buttons (Acknowledge/Respond) with status labels. Shared map synced across all tabs. Monospace timestamps. Real-time feeling throughout.

## Color Palette (OKLCH)

| Token | Light L | C | H | Dark L | C | H | Usage |
|-------|---------|---|---|--------|---|---|-------|
| background | 0.12 | 0 | 0 | 0.12 | 0 | 0 | Page bg, deep immersion |
| foreground | 0.98 | 0 | 0 | 0.98 | 0 | 0 | Text, high contrast |
| card | 0.18 | 0 | 0 | 0.18 | 0 | 0 | Surface elevation |
| primary | 0.75 | 0.18 | 200 | 0.75 | 0.18 | 200 | Buttons, links, cyan accents |
| secondary | 0.55 | 0.12 | 260 | 0.55 | 0.12 | 260 | Normal urgency alerts |
| muted | 0.45 | 0.02 | 0 | 0.45 | 0.02 | 0 | De-emphasized, grey |
| destructive | 0.60 | 0.25 | 30 | 0.60 | 0.25 | 30 | Critical alerts, traffic red |
| chart-1 | 0.68 | 0.24 | 142 | 0.68 | 0.24 | 142 | Success, traffic green |
| chart-2 | 0.75 | 0.19 | 80 | 0.75 | 0.19 | 80 | Warning, traffic yellow |
| chart-3 | 0.60 | 0.25 | 30 | 0.60 | 0.25 | 30 | Critical, traffic red |
| chart-5 | 0.55 | 0.12 | 260 | 0.55 | 0.12 | 260 | Secondary, muted blue |
| notification-critical | 0.60 | 0.25 | 30 | 0.60 | 0.25 | 30 | Badge for critical unread alerts |
| notification-high | 0.75 | 0.19 | 80 | 0.75 | 0.19 | 80 | Badge for high-priority unread alerts |

## Typography

| Role | Font | Size | Weight | Usage |
|------|------|------|--------|-------|
| Display | General Sans | 24–32px | 700 | Headers, titles, urgency labels |
| Body | DM Sans | 14–16px | 400–500 | Alert text, descriptions |
| Mono | JetBrains Mono | 12–14px | 400 | Timestamps, status codes, IDs |

## Structural Zones

| Zone | Background | Border | Treatment |
|------|------------|--------|-----------|
| Header | card | border-b | Four-tab navigation (Control Panel, Emergency Panel, Traffic User, Traffic Police) with notification badges on Emergency tab |
| Main Signal Grid | background | none | High-density grid, signal indicators with status controls |
| Map Sidebar | card/50 + backdrop-blur | border-l | Interactive map synced across all 4 tabs, shows signals and emergency hotspots |
| Emergency Message Card | card/80 + backdrop-blur | left-border (colored) | 4px left border (urgency color), action buttons (Acknowledge/Respond), status label, shadow-md |
| Footer | muted/10 | border-t | Status, live indicator, timestamp |

## Component Patterns

- **Notification Badge**: Tab header badge (red/yellow dot with count). Inline utility classes. Pulses gently on unread critical/high.
- **Emergency Message Card**: `emergency-card` utility with action buttons. Left border color maps to urgency. Monospace timestamp. Status label (Pending/Acknowledged/Responded).
- **Action Buttons**: Two-button row: "Acknowledge" (secondary, muted) + "Respond" (primary, cyan). Rounded-sm, shadow-elevated on hover.
- **Signal Indicator Grid**: Card-based, 4px border-radius, centered signal light. Status text below. Hover: shadow-elevated.
- **Interactive Map**: React component synced via context across all 4 tabs. Shows signal pins, emergency markers, real-time updates.

## Motion & Animations

- **pulse-border**: 2s infinite on critical emergency cards. Left border oscillates opacity 1→0.5.
- **pulse-badge**: 2s infinite on notification badges. Opacity 1→0.7. Gentle pulsing, never intrusive.
- **transition-smooth**: 0.3s cubic-bezier on all interactive elements (buttons, map zoom, tab transitions).
- **Message Arrival**: Fade-in + slight slide-up. ~300ms ease-out.
- **Tab Switch**: Map updates smoothly (no jump), signal grid renders immediately.

## Constraints & Anti-Patterns

- No gradients (flat color only).
- No rounded corners >8px (industrial aesthetic).
- No decorative animations (only functional pulsing/fading).
- Max 3 colors per card (bg, border, text).
- Typography: no script fonts, no italic (clarity first).
- Tab routing persistent via URL params (`?tab=control-panel`, etc.).
- Map visible in all 4 tabs simultaneously with shared global state.
- Action buttons always present on emergency messages (never hidden).
- Notification badges only on Emergency Panel tab (not on others).

## Signature Detail

Emergency messages with inline action buttons (Acknowledge/Respond) and status labels. Notification badges pulse gently on the Emergency Panel tab when critical/high alerts arrive. Interactive map persists across all tabs, showing real-time signal and emergency hotspot positions. Control Panel: full signal grid + map. Emergency Panel: message inbox + acknowledge/respond workflow + map. Traffic User: read-only signal grid + map. Traffic Police: dispatch interface with alert filtering + map. Monospace timestamps in muted grey. Urgency left border (traffic-light inspired).

## Responsive Breakpoints

- **sm (640px)**: Four-column map stacks below signal grid (layout reorganized, not collapsed).
- **md (768px)**: Standard dual-region layout (grid + map side-by-side).
- **lg (1024px)**: Increased grid density, wider map sidebar.
- **All breakpoints**: Map visible and functional in all 4 tabs.

(Total: 89 lines)
