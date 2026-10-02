"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/Badge";
import StatCard from "@/components/StatCard";
import { getReviewQueue, ReviewQueue, ReviewQueueGroup } from "@/lib/api";

const SEVERITY_META: Record<
  string,
  { icon: typeof AlertTriangle; bar: string; badge: "red" | "amber" | "gray" }
> = {
  high: { icon: XCircle, bar: "bg-danger-red", badge: "red" },
  medium: { icon: AlertTriangle, bar: "bg-warning-amber", badge: "amber" },
  low: { icon: ShieldAlert, bar: "bg-gray-400", badge: "gray" },
};

export default function ReviewSection() {
  const [queue, setQueue] = useState<ReviewQueue | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<string>("no_correct_answer");

  const load = () => {
    setLoading(true);
    setError(null);
    getReviewQueue(50)
      .then((q) => {
        setQueue(q);
        if (q.groups.length > 0 && !q.groups.some((g) => g.issue === activeGroup)) {
          setActiveGroup(q.groups[0].issue);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const active = queue?.groups.find((g) => g.issue === activeGroup) ?? null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Review Queue</h1>
          <p className="mt-1 text-sm text-text-muted">
            Questions needing human attention, grouped by issue severity.
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

      {loading && !queue && (
        <div className="mt-6 text-sm text-text-muted">Loading queue…</div>
      )}

      {queue && (
        <div className="mt-6 space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              icon={<ClipboardList className="h-5 w-5 text-primary-blue" />}
              value={String(queue.total_open)}
              label="Open items"
              sublabel="across all issue types"
            />
            <StatCard
              icon={<XCircle className="h-5 w-5 text-danger-red" />}
              value={String(
                queue.groups.find((g) => g.severity === "high")?.questions.length ?? 0,
              )}
              label="High severity"
              sublabel="no correct answer"
            />
            <StatCard
              icon={<CheckCircle2 className="h-5 w-5 text-success-green" />}
              value={String(queue.total_open > 0 ? Math.max(0, (queue.groups.find((g) => g.severity === "low")?.questions.length ?? 0)) : 0)}
              label="Low severity"
              sublabel="no provenance"
            />
          </div>

          {/* Severity tabs */}
          <div className="flex gap-2">
            {queue.groups.map((g) => {
              const meta = SEVERITY_META[g.severity] ?? SEVERITY_META.low;
              const Icon = meta.icon;
              const activeTab = g.issue === activeGroup;
              return (
                <button
                  key={g.issue}
                  onClick={() => setActiveGroup(g.issue)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab
                      ? "bg-primary-blue text-white"
                      : "border border-card-border bg-white text-text-secondary hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {g.label}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-xs ${
                      activeTab ? "bg-white/20 text-white" : "bg-gray-100 text-text-muted"
                    }`}
                  >
                    {g.questions.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active group table */}
          {active && (
            <div className="overflow-hidden rounded-xl border border-card-border bg-white">
              <div className="border-b border-card-border bg-gray-50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Badge variant={SEVERITY_META[active.severity]?.badge ?? "gray"}>
                    {active.severity}
                  </Badge>
                  <p className="text-sm font-semibold text-text-primary">{active.label}</p>
                  <p className="text-xs text-text-muted">
                    {active.questions.length} question{active.questions.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              {active.questions.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-text-muted">
                  No items in this group — clear!
                </div>
              ) : (
                <div className="thin-scroll overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-card-border text-xs uppercase tracking-wider text-text-muted">
                      <tr>
                        <th className="px-4 py-3">ID</th>
                        <th className="px-4 py-3">Question</th>
                        <th className="px-4 py-3">Subject / Topic</th>
                        <th className="px-4 py-3">Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-card-border">
                      {active.questions.map((q) => (
                        <tr key={q.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-mono text-xs text-text-muted">{q.id}</td>
                          <td className="max-w-md px-4 py-3 text-text-primary">
                            {q.question_text}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-text-secondary">
                              {q.subject} &rsaquo; {q.topic}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-text-muted">
                            {q.exam_name ? `${q.exam_name} · ${q.year}` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
