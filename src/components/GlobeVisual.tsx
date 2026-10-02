"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Globe from "react-globe.gl";
import * as THREE from "three";
import { CanvasTexture, Color, FrontSide, ShaderMaterial, Texture, Vector3 } from "three";
import * as topojson from "topojson-client";
import countries110m from "world-atlas/countries-110m.json";
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
  varying vec2 vUv;
  void main() {
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    // Compute equirectangular UV from sphere position (Y-up sphere).
    // Three.js SphereGeometry has x = -cos(theta)*sin(phi), z = sin(theta)*sin(phi),
    // so atan2(z, -x) gives the correct longitude (theta), not atan2(z, x).
    vec3 p = normalize(position);
    float lat = asin(clamp(p.y, -1.0, 1.0));
    float lng = atan(p.z, -p.x);
    // Clamp v to avoid pole singularity artifacts.
    float v = (1.57079633 - lat) / 3.14159265;
    vUv = vec2((lng + 3.14159265) / 6.2831853, clamp(v, 0.001, 0.999));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;
  uniform vec3 uSunDir;
  uniform vec3 uDayColor;
  uniform vec3 uNightColor;
  uniform float uAmbient;
  uniform sampler2D uBorders;
  uniform float uBorderOpacity;
  varying vec3 vWorldNormal;
  varying vec2 vUv;
  void main() {
    vec3 n = normalize(vWorldNormal);
    float d = dot(n, normalize(uSunDir));
    // Soft terminator band around the day/night line.
    float t = smoothstep(-0.18, 0.12, d);
    vec3 col = mix(uNightColor, uDayColor, t);
    // Faint ambient so the night hemisphere isn't pure black.
    col += uNightColor * uAmbient;
    // Land fill from the baked texture. The green channel holds the filled
    // land mask (1 = land, 0 = ocean); the red channel holds border lines.
    vec4 landTex = texture2D(uBorders, vUv);
    float land = landTex.g;
    float border = landTex.r;
    vec3 landColor = vec3(0.72, 0.08, 0.08);
    vec3 borderColor = vec3(1.0, 1.0, 1.0);
    col = mix(col, landColor, land);
    col = mix(col, borderColor, border * uBorderOpacity);
    gl_FragColor = vec4(col, 1.0);
  }
`;

function createDayNightMaterial(bordersTexture: Texture): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      uSunDir: { value: new Vector3(0, 0, 1) },
      uDayColor: { value: new Color(0.085, 0.085, 0.10) }, // subtly brighter
      uNightColor: { value: new Color(0.030, 0.030, 0.038) }, // near-black
      uAmbient: { value: 0.4 },
      uBorders: { value: bordersTexture },
      uBorderOpacity: { value: 1.0 },
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    side: FrontSide,
  });
}

/* ------------------------------------------------------------------ */
/*  Country border texture                                             */
/*  Draws Natural Earth boundaries onto a 2:1 equirectangular canvas,  */
/*  returns a CanvasTexture for the globe shader to sample.            */
/* ------------------------------------------------------------------ */

const TEX_W = 2048;
const TEX_H = 1024;

function lngToX(lng: number): number {
  return ((lng + 180) / 360) * TEX_W;
}

function latToY(lat: number): number {
  return ((90 - lat) / 180) * TEX_H;
}

function drawCountryBorders(features: any[]): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = TEX_W;
  canvas.height = TEX_H;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, TEX_W, TEX_H);

  // Helper: draw a ring at a given longitude offset (handles antimeridian
  // wrapping — polygons that cross lng ±180° are drawn again shifted ±360°
  // so the fill/stroke wraps seamlessly on the globe).
  const drawRing = (
    ring: number[][],
    drawFn: (x: number, y: number, first: boolean) => void,
    offset: number,
  ) => {
    for (let i = 0; i < ring.length; i++) {
      const [lng, lat] = ring[i];
      const x = lngToX(lng + offset);
      const y = latToY(lat);
      drawFn(x, y, i === 0);
    }
  };

  // Determine if a ring crosses the antimeridian (a jump > 180° between
  // consecutive vertices means it wraps around).
  const crossesAntimeridian = (ring: number[][]): boolean => {
    for (let i = 1; i < ring.length; i++) {
      if (Math.abs(ring[i][0] - ring[i - 1][0]) > 180) return true;
    }
    return false;
  };

  // Track rings with their source feature so we can skip Antarctica's
  // outline (it's not a country border — drawing it produces a horizontal
  // ring across the south pole on the globe).
  const allRings: { ring: number[][]; skipBorder: boolean }[] = [];
  for (const feature of features) {
    const geom = feature.geometry;
    if (!geom) continue;
    const coords =
      geom.type === "Polygon"
        ? geom.coordinates
        : geom.type === "MultiPolygon"
          ? geom.coordinates.flat()
          : null;
    if (coords) {
      // Antarctica and Fiji both have polygons that span all longitudes
      // (cross the antimeridian with a 360° jump). Stroking them draws a
      // hard horizontal ring across the texture — Antarctica near the south
      // pole, Fiji near the equator. Neither is a country border, so skip
      // their outlines.
      const name = feature.properties?.name;
      const skipBorder = name === "Antarctica" || name === "Fiji";
      for (const ring of coords) {
        allRings.push({ ring, skipBorder });
      }
    }
  }

  // --- Channel G (green): filled land mask drawn first ---
  ctx.fillStyle = "#00ff00";
  for (const { ring } of allRings) {
    const offsets = crossesAntimeridian(ring) ? [-360, 0, 360] : [0];
    for (const off of offsets) {
      ctx.beginPath();
      drawRing(ring, (x, y, first) => {
        if (first) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }, off);
      ctx.closePath();
      ctx.fill();
    }
  }

  // --- Channel R (red): border lines drawn on top ---
  ctx.strokeStyle = "#ff0000";
  ctx.lineWidth = 2.2;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  for (const { ring, skipBorder } of allRings) {
    if (skipBorder) continue;
    const offsets = crossesAntimeridian(ring) ? [-360, 0, 360] : [0];
    for (const off of offsets) {
      ctx.beginPath();
      drawRing(ring, (x, y, first) => {
        if (first) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }, off);
      ctx.closePath();
      ctx.stroke();
    }
  }

  const tex = new CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  // The canvas is drawn with north at the top (y=0) and south at the bottom
  // (y=TEX_H). The vertex shader maps the north pole to v=0 and south pole to
  // v=1. CanvasTexture defaults to flipY=true, which would sample v=0 from
  // the canvas bottom (south) — vertically inverting the continents. Set
  // flipY=false so v=0 samples the canvas top (north), keeping the globe
  // north-up.
  tex.flipY = false;
  tex.needsUpdate = true;
  return tex;
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
  const [globeSize, setGlobeSize] = useState(GLOBE_SIZE);
  const wrapperRef = useRef<HTMLDivElement>(null);

  /* Responsive globe size — shrink on small viewports so it fits mobile. */
  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      // On mobile, cap to viewport minus a 16px gutter on each side.
      const capped = vw <= 640 ? Math.min(GLOBE_SIZE, vw - 32) : GLOBE_SIZE;
      setGlobeSize(Math.max(220, capped));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  /* Real country polygons from Natural Earth (world-atlas 110m). Used to
     bake a border texture onto the globe shader — no separate meshes,
     so they never interfere with the point raycaster that drives clicks. */
  const countryFeatures = useMemo(() => {
    const fc = topojson.feature(
      countries110m as any,
      countries110m.objects.countries as any,
    );
    return (fc as any).features as any[];
  }, []);

  /* Day/night material — created once with the baked country-border
     texture, sun uniform updated on a timer. The borders are drawn by
     the shader (no separate meshes), so they never interfere with the
     point raycaster that drives marker clicks. */
  const globeMaterial = useMemo(() => {
    const bordersTex = drawCountryBorders(countryFeatures);
    const mat = createDayNightMaterial(bordersTex);
    materialRef.current = mat;
    return mat;
  }, [countryFeatures]);

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
    // Neutral global view — not centered on any single country/region.
    globeEl.current?.pointOfView({ lat: 18, lng: 0, altitude: 2.2 });

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
        style={{ width: globeSize, height: globeSize, maxWidth: "100%" }}
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
        style={{ width: globeSize, height: globeSize, maxWidth: "100%" }}
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

      {/* Globe — auto-rotates continuously; pauses only while dragging. */}
      <div
        ref={wrapperRef}
        className="relative"
        style={{ width: globeSize, height: globeSize, maxWidth: "100%" }}
        aria-label="Rotating 3D globe showing world events"
      >
        <Globe
          ref={globeEl}
          width={globeSize}
          height={globeSize}
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
          pointColor={() => "#ffdd00"}
          pointAltitude={0.04}
          pointRadius={(d: any) => (d.count > 1 ? 1.6 : 1.3)}
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