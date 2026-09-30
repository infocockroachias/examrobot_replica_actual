"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Globe from "react-globe.gl";
import { Color, FrontSide, ShaderMaterial, Vector3 } from "three";
import { Badge } from "@/components/Badge";
import { getEvents, type WorldEvent } from "@/lib/api";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const GLOBE_COLOR = "#0A0A0A";
const MARKER_COLOR = "#E60000";
const MAX_MARKERS = 120; // cap rendered markers (perf + clutter)
const POLL_INTERVAL_MS = 60_000; // frontend polls backend every 60s
const SUN_UPDATE_MS = 60_000; // recompute sun position every 60s
const RESUME_DELAY_MS = 2500; // resume auto-rotate 2.5s after drag ends
const GLOBE_SIZE = 460;

/* ------------------------------------------------------------------ */
/*  Category styling — maps each category to a Badge variant + color   */
/* ------------------------------------------------------------------ */

type BadgeVariant =
  | "neutral"
  | "red"
  | "brand"
  | "blue"
  | "green"
  | "purple"
  | "teal"
  | "dark"
  | "amber"
  | "gray";

const CATEGORY_STYLE: Record<string, { variant: BadgeVariant; dot: string }> = {
  "Politics & Governance": { variant: "blue", dot: "#3b82f6" },
  "Conflict & Security": { variant: "red", dot: "#dc2626" },
  Economy: { variant: "amber", dot: "#d97706" },
  "Science & Technology": { variant: "purple", dot: "#9333ea" },
  Environment: { variant: "green", dot: "#16a34a" },
  Disaster: { variant: "red", dot: "#dc2626" },
  Society: { variant: "teal", dot: "#0d9488" },
  Health: { variant: "green", dot: "#16a34a" },
  Other: { variant: "gray", dot: "#9ca3af" },
};

function categoryStyle(category: string): { variant: BadgeVariant; dot: string } {
  return CATEGORY_STYLE[category] ?? { variant: "gray", dot: "#9ca3af" };
}

/* ------------------------------------------------------------------ */
/*  Sun position from UTC — returns a unit direction vector (Y-up)     */
/*  Subsolar latitude = declination; subsolar longitude tracks UTC.   */
/* ------------------------------------------------------------------ */

function subsolarDirection(date: Date): Vector3 {
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
  // Solar declination (radians). Good-enough approximation for a subtle
  // day/night terminator — accurate to ~1° across the year.
  const declination =
    (-23.44 * Math.PI) / 180 * Math.cos(((2 * Math.PI) / 365) * (dayOfYear + 10));
  // Subsolar longitude: at UTC noon the sun is over longitude 0°.
  const utcHours =
    date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const lng = ((12 - utcHours) * 15 * Math.PI) / 180;
  const lat = declination;
  // Cartesian, Y up (Three.js convention).
  return new Vector3(
    Math.cos(lat) * Math.cos(lng),
    Math.sin(lat),
    Math.cos(lat) * Math.sin(lng),
  ).normalize();
}

/* ------------------------------------------------------------------ */
/*  Day/night ShaderMaterial                                           */
/*  Lights the sphere from the subsolar direction; soft terminator.    */
/* ------------------------------------------------------------------ */

const VERTEX_SHADER = /* glsl */ `
  varying vec3 vWorldNormal;
  void main() {
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;
  uniform vec3 uSunDir;
  uniform vec3 uDayColor;
  uniform vec3 uNightColor;
  uniform float uAmbient;
  varying vec3 vWorldNormal;
  void main() {
    vec3 n = normalize(vWorldNormal);
    float d = dot(n, normalize(uSunDir));
    // Soft terminator band around the day/night line.
    float t = smoothstep(-0.18, 0.12, d);
    vec3 col = mix(uNightColor, uDayColor, t);
    // Faint ambient so the night hemisphere isn't pure black.
    col += uNightColor * uAmbient;
    gl_FragColor = vec4(col, 1.0);
  }
`;

function createDayNightMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      uSunDir: { value: new Vector3(0, 0, 1) },
      uDayColor: { value: new Color(0.085, 0.085, 0.10) }, // subtly brighter
      uNightColor: { value: new Color(0.030, 0.030, 0.038) }, // near-black
      uAmbient: { value: 0.4 },
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    side: FrontSide,
  });
}

/* ------------------------------------------------------------------ */
/*  Relative-time formatter — "12 min ago" from an ISO timestamp      */
/* ------------------------------------------------------------------ */

function relativeTime(iso: string | null): string | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return null;
  const diffMs = Date.now() - t;
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

/* ------------------------------------------------------------------ */
/*  Lightweight spatial clustering                                     */
/*  Merges events within a ~4° grid cell into one marker with a count.*/
/* ------------------------------------------------------------------ */

interface ClusterPoint {
  lat: number;
  lng: number;
  count: number;
  primary: WorldEvent; // most recent event in the cluster (for popup)
  events: WorldEvent[];
}

function clusterMarkers(events: WorldEvent[]): ClusterPoint[] {
  const cells = new Map<string, { lat: number; lng: number; events: WorldEvent[] }>();
  for (const ev of events) {
    const gx = Math.floor(ev.latitude / 4);
    const gy = Math.floor(ev.longitude / 4);
    const key = `${gx}:${gy}`;
    const cell = cells.get(key) ?? { lat: 0, lng: 0, events: [] };
    cell.lat += ev.latitude;
    cell.lng += ev.longitude;
    cell.events.push(ev);
    cells.set(key, cell);
  }
  const out: ClusterPoint[] = [];
  for (const cell of cells.values()) {
    const primary = cell.events.reduce((a, b) =>
      (a.published_at ?? "") > (b.published_at ?? "") ? a : b,
    );
    out.push({
      lat: cell.lat / cell.events.length,
      lng: cell.lng / cell.events.length,
      count: cell.events.length,
      primary,
      events: cell.events,
    });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

type Status = "loading" | "ready" | "error";

export default function GlobeVisual() {
  const globeEl = useRef<any>(null);
  const materialRef = useRef<ShaderMaterial | null>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const sunTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const [events, setEvents] = useState<WorldEvent[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [active, setActive] = useState<ClusterPoint | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [now, setNow] = useState<number>(Date.now());

  /* Day/night material — created once, sun uniform updated on a timer.  */
  const globeMaterial = useMemo(() => {
    const mat = createDayNightMaterial();
    materialRef.current = mat;
    return mat;
  }, []);

  /* Detect prefers-reduced-motion.                                    */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  /* Fetch events from our backend. No external calls from the client.  */
  const fetchEvents = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const data = await getEvents({
        category: category ?? undefined,
        limit: 300,
        include_sample: false,
      });
      if (!mountedRef.current || controller.signal.aborted) return;
      setEvents(data.events);
      setLastUpdated(new Date().toISOString());
      setStatus("ready");
    } catch {
      if (!mountedRef.current || controller.signal.aborted) return;
      // If we already have data, keep showing it; only flip to error on a
      // total failure with nothing cached.
      setEvents((prev) => {
        if (prev.length === 0) setStatus("error");
        return prev;
      });
    }
  }, [category]);

  /* Initial fetch + polling.                                           */
  useEffect(() => {
    mountedRef.current = true;
    fetchEvents();
    pollTimer.current = setInterval(fetchEvents, POLL_INTERVAL_MS);
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, [fetchEvents]);

  /* Keep a "now" tick so relative times refresh without a refetch.      */
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  /* Update the subsolar direction on the shader material periodically. */
  useEffect(() => {
    const mat = materialRef.current;
    if (!mat) return;
    const apply = () => {
      const dir = subsolarDirection(new Date());
      (mat.uniforms.uSunDir.value as Vector3).copy(dir);
    };
    apply();
    sunTimer.current = setInterval(apply, SUN_UPDATE_MS);
    return () => {
      if (sunTimer.current) clearInterval(sunTimer.current);
    };
  }, [globeMaterial]);

  /* Wire auto-rotation + pause/resume on the OrbitControls.            */
  const onGlobeReady = () => {
    const controls: any = globeEl.current?.controls();
    if (controls) {
      controls.autoRotate = !reducedMotion;
      controls.autoRotateSpeed = 0.5;
    }
    globeEl.current?.pointOfView({ lat: 22, lng: 78, altitude: 2.0 });

    const pause = () => {
      controls.autoRotate = false;
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
    const scheduleResume = () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
      resumeTimer.current = setTimeout(() => {
        const c = globeEl.current?.controls();
        if (c && !reducedMotion) c.autoRotate = true;
      }, RESUME_DELAY_MS);
    };
    controls.addEventListener("start", pause);
    controls.addEventListener("end", scheduleResume);
  };

  useEffect(() => {
    return () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, []);

  /* Derived: cluster + cap markers for the current category.          */
  const points = useMemo<ClusterPoint[]>(() => {
    const filtered = category
      ? events.filter((e) => e.category === category)
      : events;
    // Sort by recency (most recent first) so capping keeps fresh events.
    const sorted = [...filtered].sort((a, b) =>
      (b.published_at ?? "").localeCompare(a.published_at ?? ""),
    );
    const clustered = clusterMarkers(sorted.slice(0, MAX_MARKERS * 2));
    return clustered.slice(0, MAX_MARKERS);
  }, [events, category]);

  /* Categories actually present in the data (for the filter UI).       */
  const presentCategories = useMemo(() => {
    const set = new Set<string>();
    for (const e of events) set.add(e.category);
    return Array.from(set).sort();
  }, [events]);

  const totalCount = points.reduce((s, p) => s + p.count, 0);

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  // Error / empty states — never show a broken empty black sphere.
  if (status === "error" || (status === "ready" && events.length === 0)) {
    return (
      <div
        className="mx-auto flex flex-col items-center justify-center rounded-2xl border border-card-border bg-cream px-6 py-10 text-center"
        style={{ width: GLOBE_SIZE, height: GLOBE_SIZE, maxWidth: "100%" }}
        role="status"
      >
        <div className="mb-3 text-2xl" aria-hidden>
          🛰️
        </div>
        <p className="max-w-xs text-sm font-medium text-text-secondary">
          World event data is temporarily unavailable.
        </p>
        <button
          onClick={fetchEvents}
          className="mt-4 rounded-full border-2 border-text-primary bg-white px-5 py-2 text-sm font-semibold text-text-primary transition-all hover:bg-text-primary hover:text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div
        className="mx-auto flex flex-col items-center justify-center"
        style={{ width: GLOBE_SIZE, height: GLOBE_SIZE, maxWidth: "100%" }}
        role="status"
        aria-label="Loading world events"
      >
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-card-border border-t-text-primary" />
        <p className="mt-3 text-xs text-text-muted">Loading world events…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex flex-col items-center" style={{ maxWidth: "100%" }}>
      {/* Header row: title + live indicator + last-updated */}
      <div className="mb-3 flex w-full items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="font-display text-sm font-bold text-text-primary">
            World Events
          </span>
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{
              background: MARKER_COLOR,
              boxShadow: `0 0 6px ${MARKER_COLOR}`,
            }}
            aria-hidden
          />
          <span className="text-[11px] text-text-muted">
            {totalCount} marker{totalCount === 1 ? "" : "s"}
          </span>
        </div>
        <span className="text-[11px] text-text-muted">
          {relativeTime(lastUpdated) ? `Updated ${relativeTime(lastUpdated)}` : "Live"}
        </span>
      </div>

      {/* Category filter */}
      <div className="mb-3 flex w-full flex-wrap gap-1.5 px-1">
        <button
          onClick={() => setCategory(null)}
          className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-all ${
            category === null
              ? "bg-text-primary text-white"
              : "bg-white text-text-secondary border border-card-border hover:border-text-primary"
          }`}
        >
          All
        </button>
        {presentCategories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-all ${
              category === c
                ? "bg-text-primary text-white"
                : "bg-white text-text-secondary border border-card-border hover:border-text-primary"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Globe */}
      <div
        className="relative"
        style={{ width: GLOBE_SIZE, height: GLOBE_SIZE, maxWidth: "100%" }}
        aria-label="Rotating 3D globe showing world events"
      >
        <Globe
          ref={globeEl}
          width={GLOBE_SIZE}
          height={GLOBE_SIZE}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl={null}
          bumpImageUrl={null}
          showAtmosphere={false}
          showGraticules={true}
          globeMaterial={globeMaterial}
          /* Raise the Points raycast threshold so small markers are reliably
             hoverable/clickable. lineHoverPrecision's onChange sets BOTH the
             Line and Points thresholds on ThreeRenderObjects (default 1 world
             unit on a 100-unit globe is far too small for clicking). */
          lineHoverPrecision={12}
          onGlobeReady={onGlobeReady}
          pointsData={points}
          pointLat={(d: any) => d.lat}
          pointLng={(d: any) => d.lng}
          pointColor={(d: any) => categoryStyle(d.primary.category).dot}
          pointAltitude={0.02}
          pointRadius={(d: any) => (d.count > 1 ? 0.5 : 0.35)}
          pointResolution={16}
          pointsMerge={false}
          pointLabel={(d: any) => {
            const ev = d.primary as WorldEvent;
            const count = d.count as number;
            const extra = count > 1 ? ` <span style="color:#f87171">+${count - 1}</span>` : "";
            return `<div style="font-family:system-ui;font-size:11px;color:#fff;background:rgba(10,10,10,0.9);padding:3px 7px;border-radius:6px;white-space:nowrap;border:1px solid rgba(255,255,255,0.12);">${ev.title}${extra}</div>`;
          }}
          onPointClick={(point: any) => setActive(point as ClusterPoint)}
          onGlobeClick={() => setActive(null)}
        />

        {/* Popup card — reuses Badge styling. */}
        {active && <EventPopup point={active} onClose={() => setActive(null)} />}
      </div>

      {/* Footer caption — honest about data sources. */}
      <p className="mt-2 px-1 text-center text-[10px] text-text-muted">
        Events from USGS, GDELT &amp; other open feeds · day/night from UTC sun position ·
        refreshes automatically
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Popup card                                                         */
/* ------------------------------------------------------------------ */

function EventPopup({ point, onClose }: { point: ClusterPoint; onClose: () => void }) {
  const ev = point.primary;
  const style = categoryStyle(ev.category);
  const when = relativeTime(ev.published_at);

  return (
    <div
      className="pointer-events-auto absolute left-2 top-2 z-20 w-64 rounded-xl border border-card-border bg-white p-4 shadow-xl"
      style={{ maxWidth: "calc(100% - 16px)" }}
      role="dialog"
      aria-label={ev.title}
    >
      <button
        onClick={onClose}
        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-text-muted hover:bg-gray-100 hover:text-text-primary"
        aria-label="Close"
      >
        ✕
      </button>

      <Badge variant={style.variant}>{ev.category}</Badge>

      <h4 className="mt-2 text-sm font-bold leading-snug text-text-primary">
        {ev.title}
      </h4>

      <div className="mt-1.5 flex items-center gap-2 text-[11px] text-text-muted">
        {ev.location_name && <span>📍 {ev.location_name}</span>}
      </div>

      {ev.description && (
        <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-text-secondary">
          {ev.description}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-card-border pt-2.5">
        <div className="flex flex-col gap-0.5">
          {when && (
            <span className="text-[11px] font-medium text-text-secondary">{when}</span>
          )}
          {ev.source_name && (
            <span className="text-[10px] uppercase tracking-wide text-text-muted">
              {ev.source_name}
            </span>
          )}
        </div>
        {ev.source_url && (
          <a
            href={ev.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-card-border bg-white px-3 py-1.5 text-[11px] font-semibold text-text-primary transition-all hover:bg-text-primary hover:text-white"
          >
            Read source ↗
          </a>
        )}
      </div>

      {point.count > 1 && (
        <p className="mt-2 text-[10px] text-text-muted">
          +{point.count - 1} more event{point.count - 2 ? "s" : ""} in this area
        </p>
      )}
    </div>
  );
}