"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Database,
  History,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/Badge";
import StatCard from "@/components/StatCard";
import { ContentAnalytics, getContentAnalytics } from "@/lib/api";

export default function AnalyticsSection() {
  const [data, setData] = useState<ContentAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getContentAnalytics()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Content Analytics</h1>
          <p className="mt-1 text-sm text-text-muted">
            Questions by exam, year, subject, and topic — plus provenance coverage.
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

      {loading && !data && (
        <div className="mt-6 text-sm text-text-muted">Crunching numbers…</div>
      )}

      {data && (
        <div className="mt-6 space-y-6">
          {/* Top-line stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              icon={<Database className="h-5 w-5 text-primary-blue" />}
              value={String(data.total)}
              label="Total questions"
              sublabel={`across ${data.by_exam.length} exams`}
            />
            <StatCard
              icon={<BarChart3 className="h-5 w-5 text-success-green" />}
              value={`${data.provenance_coverage.pct}%`}
              label="With provenance"
              sublabel={`${data.provenance_coverage.with_provenance} of ${data.provenance_coverage.total}`}
              progress={data.provenance_coverage.pct}
              progressColor="bg-success-green"
            />
            <StatCard
              icon={<CheckCircle2 className="h-5 w-5 text-info-teal" />}
              value={String(data.mock_vs_real.real)}
              label="Real questions"
              sublabel={`${data.mock_vs_real.mock} mock remaining`}
            />
            <StatCard
              icon={<BookOpen className="h-5 w-5 text-purple-accent" />}
              value={String(data.by_year.length)}
              label="Years covered"
              sublabel={
                data.by_year.length > 0
                  ? `${data.by_year[0].year}–${data.by_year[data.by_year.length - 1].year}`
                  : "no data"
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* By exam */}
            <BreakdownCard
              title="Questions by exam"
              icon={<BookOpen className="h-4 w-4 text-primary-blue" />}
              rows={data.by_exam.map((r) => ({
                label: r.name,
                count: r.count,
              }))}
              total={data.total}
            />

            {/* By year */}
            <BreakdownCard
              title="Questions by year"
              icon={<History className="h-4 w-4 text-info-teal" />}
              rows={data.by_year.map((r) => ({
                label: String(r.year),
                count: r.count,
              }))}
              total={data.total}
            />

            {/* By subject */}
            <BreakdownCard
              title="Top subjects"
              icon={<Layers className="h-4 w-4 text-purple-accent" />}
              rows={data.by_subject.map((r) => ({
                label: r.name,
                count: r.count,
              }))}
              total={data.total}
            />

            {/* By topic */}
            <BreakdownCard
              title="Top topics"
              icon={<BarChart3 className="h-4 w-5 text-warning-amber" />}
              rows={data.by_topic.map((r) => ({
                label: r.name,
                count: r.count,
              }))}
              total={data.total}
            />
          </div>

          {/* Recent imports */}
          {data.recent_imports.length > 0 && (
            <div className="rounded-xl border border-card-border bg-white p-5">
              <h3 className="text-sm font-bold text-text-primary">Recent imports</h3>
              <div className="mt-3 space-y-2">
                {data.recent_imports.map((imp) => (
                  <div
                    key={imp.batch_id}
                    className="flex items-center justify-between rounded-lg border border-card-border px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm text-text-primary">{imp.filename}</p>
                      <p className="text-xs text-text-muted">
                        {imp.uploaded_at ? new Date(imp.uploaded_at).toLocaleString() : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="green">{imp.committed}</Badge>
                      {imp.duplicates > 0 && <Badge variant="amber">{imp.duplicates} dup</Badge>}
                      {imp.invalid > 0 && <Badge variant="red">{imp.invalid} inv</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BreakdownCard({
  title,
  icon,
  rows,
  total,
}: {
  title: string;
  icon: React.ReactNode;
  rows: { label: string; count: number }[];
  total: number;
}) {
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <div className="rounded-xl border border-card-border bg-white p-5">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-bold text-text-primary">{title}</h3>
      </div>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-text-muted">No data.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {rows.map((r) => (
            <div key={r.label}>
              <div className="flex items-center justify-between text-xs">
                <span className="truncate text-text-secondary">{r.label}</span>
                <span className="ml-2 shrink-0 font-medium text-text-primary">{r.count}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-primary-blue"
                  style={{ width: `${(r.count / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
