/**
 * ECORP learning analytics — client events for funnel & lesson insight.
 * Phase 1: structured console + local buffer (no PII beyond uid hash optional).
 * Phase 2: post to /api/analytics when available.
 */

export type AnalyticsEventName =
  | "page_view"
  | "lesson_open"
  | "lesson_complete"
  | "track_select"
  | "assessment_submit"
  | "auth_modal_open"
  | "sandbox_run"
  | "mission_evaluate";

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  ts: number;
  props?: Record<string, string | number | boolean | null | undefined>;
}

const BUFFER_KEY = "ecorp_analytics_buffer_v1";
const MAX_BUFFER = 100;

function readBuffer(): AnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(BUFFER_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeBuffer(events: AnalyticsEvent[]) {
  try {
    localStorage.setItem(BUFFER_KEY, JSON.stringify(events.slice(-MAX_BUFFER)));
  } catch {
    /* private mode */
  }
}

export function track(
  name: AnalyticsEventName,
  props?: AnalyticsEvent["props"]
): void {
  const event: AnalyticsEvent = {
    name,
    ts: Date.now(),
    props: props || {},
  };

  if (typeof console !== "undefined" && console.info) {
    console.info("[ECORP:ANALYTICS]", name, props || {});
  }

  if (typeof localStorage === "undefined") return;
  const buf = readBuffer();
  buf.push(event);
  writeBuffer(buf);
}

export function getRecentAnalytics(limit = 20): AnalyticsEvent[] {
  return readBuffer().slice(-limit);
}

export function clearAnalyticsBuffer(): void {
  try {
    localStorage.removeItem(BUFFER_KEY);
  } catch {
    /* ignore */
  }
}
