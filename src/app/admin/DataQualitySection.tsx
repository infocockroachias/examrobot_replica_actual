"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  HeartPulse,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/Badge";
import StatCard from "@/components/StatCard";
import { DataQuality, getDataQuality } from "@/lib/api";

const ISSUE_META: Record<
  string,
  { label: string; icon: typeof AlertTriangle; variant: "red" | "amber" | "gray"; accent: string }
> = {
  unclassified: {
    label: "Unclassified",
    icon: AlertTriangle,
    variant: "amber",
    accent: "text-warning-amber",
  },
  no_correct_answer: {
    label: "No correct answer",
    icon: XCircle,
    variant: "red",
    accent: "text-danger-red",
  },
  no_provenance: {
    label: "No provenance",
    icon: ShieldAlert,
    variant: "gray",
    accent: "text-text-muted",
  },
  mock_data: {
    label: "Legacy mock data",
    icon: AlertTriangle,
    variant: "gray",
    accent: "text-text-muted",
  },
};

export default function DataQualitySection() {
  const [dq, setDq] = useState<DataQuality | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getDataQuality()
      .then(setDq)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const health = dq?.health_score ?? 0;
  const healthColor =
    health >= 80 ? "text-success-green" : health >= 50 ? "text-warning-amber" : "text-danger-red";
  const healthLabel =
    health >= 80 ? "Good" : health >= 50 ? "Fair" : "Needs attention";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Data Quality</h1>
          <p className="mt-1 text-sm text-text-muted">
            Content health at a glance — questions that need fixing.
          </p>
        </div>
        <button
          onClick={load}
          className="rounded-lg border border-card-border bg-white px-3 py-2 text-sm font-medium text-text-secondary hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-danger-red/30 bg-danger-bg p-3 text-sm text-danger-red">
          {error}
        </div>
      )}

      {loading && !dq && (
        <div className="mt-6 text-sm text-text-muted">Analyzing content…</div>
      )}

      {dq && (
        <div className="mt-6 space-y-6">
          {/* Health score */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              icon={<HeartPulse className={`h-5 w-5 ${healthColor}`} />}
              value={`${health}`}
              label="Content Health"
              sublabel={`out of 100 · ${healthLabel}`}
              progress={health}
              progressColor={health >= 80 ? "bg-success-green" : health >= 50 ? "bg-warning-amber" : "bg-danger-red"}
            />
            <StatCard
              icon={<CheckCircle2 className="h-5 w-5 text-success-green" />}
              value={String(dq.total)}
              label="Total questions"
              sublabel="across all papers"
            />
            <StatCard
              icon={<AlertTriangle className="h-5 w-5 text-warning-amber" />}
              value={String(
                Object.values(dq.issues).reduce((sum, i) => sum + i.count, 0),
              )}
              label="Total issues"
              sublabel="sum across all issue types"
            />
          </div>

          {/* Issue cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Object.entries(dq.issues).map(([key, info]) => {
              const meta = ISSUE_META[key] ?? {
                label: key,
                icon: AlertTriangle,
                variant: "gray" as const,
                accent: "text-text-muted",
              };
              const Icon = meta.icon;
              return (
                <div
                  key={key}
                  className="rounded-xl border border-card-border bg-white p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${meta.accent}`} />
                      <p className="text-sm font-semibold text-text-primary">{meta.label}</p>
                    </div>
                    <Badge variant={meta.variant}>{info.count}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-text-secondary">{info.detail}</p>
                  <div className="mt-3">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full ${
                          meta.variant === "red"
                            ? "bg-danger-red"
                            : meta.variant === "amber"
                              ? "bg-warning-amber"
                              : "bg-gray-400"
                        }`}
                        style={{ width: `${Math.min(100, info.pct)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-text-muted">{info.pct}% of questions</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
