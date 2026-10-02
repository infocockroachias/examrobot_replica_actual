"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Layers,
  ArrowRightLeft,
  Search,
} from "lucide-react";
import { Badge } from "@/components/Badge";
import StatCard from "@/components/StatCard";
import {
  SubjectStat,
  TaxonomyInventory,
  getTaxonomyInventory,
} from "@/lib/api";

export default function SubjectsSection() {
  const [inventory, setInventory] = useState<TaxonomyInventory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  // Merge/reassign UI state
  const [mergeFrom, setMergeFrom] = useState("");
  const [mergeTo, setMergeTo] = useState("");
  const [mergeMsg, setMergeMsg] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getTaxonomyInventory()
      .then(setInventory)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const toggleExpand = (name: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const filtered = useMemo(() => {
    if (!inventory) return [];
    const q = search.trim().toLowerCase();
    if (!q) return inventory.subjects;
    return inventory.subjects.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.topics.some(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.subtopics.some((st) => (st.name ?? "").toLowerCase().includes(q)),
        ),
    );
  }, [inventory, search]);

  // All distinct strings for the merge dropdown.
  const allTerms = useMemo(() => {
    const terms: string[] = [];
    inventory?.subjects.forEach((s) => {
      terms.push(s.name);
      s.topics.forEach((t) => {
        terms.push(t.name);
        t.subtopics.forEach((st) => {
          if (st.name) terms.push(st.name);
        });
      });
    });
    return Array.from(new Set(terms)).sort();
  }, [inventory]);

  const handleMerge = () => {
    setMergeMsg(null);
    if (!mergeFrom || !mergeTo) {
      setMergeMsg("Pick both a source and a target term.");
      return;
    }
    if (mergeFrom.toLowerCase() === mergeTo.toLowerCase()) {
      setMergeMsg("Source and target must differ.");
      return;
    }
    // The backend merge endpoint is not yet implemented (string-based taxonomy
    // requires a backfill query). Surface a clear message rather than silently
    // no-op — this is a UI placeholder wired for the future endpoint.
    setMergeMsg(
      `Merge "${mergeFrom}" → "${mergeTo}": connect a backend endpoint (e.g. POST /admin/taxonomy/merge) to apply the reassignment.`,
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Subjects &amp; Topics</h1>
          <p className="mt-1 text-sm text-text-muted">
            String-based taxonomy inventory. Search, inspect, and merge/reassign.
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

      {loading && !inventory && (
        <div className="mt-6 text-sm text-text-muted">Loading taxonomy…</div>
      )}

      {inventory && (
        <div className="mt-6 space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              icon={<Layers className="h-5 w-5 text-primary-blue" />}
              value={String(inventory.subjects.length)}
              label="Subjects"
              sublabel="distinct values"
            />
            <StatCard
              icon={<Layers className="h-5 w-5 text-purple-accent" />}
              value={String(
                new Set(inventory.subjects.flatMap((s) => s.topics.map((t) => t.name))).size,
              )}
              label="Topics"
              sublabel="distinct values"
            />
            <StatCard
              icon={<Layers className="h-5 w-5 text-info-teal" />}
              value={String(
                new Set(
                  inventory.subjects.flatMap((s) =>
                    s.topics.flatMap((t) => t.subtopics.map((st) => st.name)),
                  ),
                ).size,
              )}
              label="Subtopics"
              sublabel="distinct values"
            />
            <StatCard
              icon={<Layers className="h-5 w-5 text-warning-amber" />}
              value={String(
                inventory.subjects.reduce((sum, s) => sum + s.count, 0),
              )}
              label="Total questions"
              sublabel="across all taxonomy"
            />
          </div>

          {/* Merge / reassign tool */}
          <div className="rounded-xl border border-card-border bg-white p-5">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-primary-blue" />
              <h3 className="text-sm font-bold text-text-primary">Merge / reassign</h3>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Rename all questions with one term to another (e.g. merge "Polity" into
              "Governance"). Requires a backend endpoint to apply.
            </p>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <div className="min-w-[180px] flex-1">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Source term
                </label>
                <select
                  value={mergeFrom}
                  onChange={(e) => setMergeFrom(e.target.value)}
                  className="w-full rounded-lg border border-card-border bg-white px-3 py-2 text-sm focus:border-primary-blue focus:outline-none"
                >
                  <option value="">Select…</option>
                  {allTerms.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <ArrowRightLeft className="mb-2 h-4 w-4 text-text-muted" />
              <div className="min-w-[180px] flex-1">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Target term
                </label>
                <select
                  value={mergeTo}
                  onChange={(e) => setMergeTo(e.target.value)}
                  className="w-full rounded-lg border border-card-border bg-white px-3 py-2 text-sm focus:border-primary-blue focus:outline-none"
                >
                  <option value="">Select…</option>
                  {allTerms.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleMerge}
                className="rounded-lg bg-primary-blue px-4 py-2 text-sm font-medium text-white hover:bg-primary-blue-dark"
              >
                Merge
              </button>
            </div>
            {mergeMsg && (
              <p
                className={`mt-2 text-xs ${
                  mergeMsg.startsWith("Merge") ? "text-warning-amber" : "text-danger-red"
                }`}
              >
                {mergeMsg}
              </p>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subjects, topics, subtopics…"
              className="w-full rounded-lg border border-card-border bg-white py-2 pl-9 pr-3 text-sm focus:border-primary-blue focus:outline-none"
            />
          </div>

          {/* Taxonomy tree */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="rounded-xl border border-card-border bg-white px-4 py-8 text-center text-sm text-text-muted">
                No matching taxonomy terms.
              </div>
            ) : (
              filtered.map((subject) => (
                <SubjectCard
                  key={subject.name}
                  subject={subject}
                  expanded={expanded.has(subject.name)}
                  onToggle={() => toggleExpand(subject.name)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SubjectCard({
  subject,
  expanded,
  onToggle,
}: {
  subject: SubjectStat;
  expanded: boolean;
  onToggle: () => void;
}) {
  const [topicExpanded, setTopicExpanded] = useState<Set<string>>(new Set());
  const toggleTopic = (name: string) =>
    setTopicExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  return (
    <div className="overflow-hidden rounded-xl border border-card-border bg-white">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          <Layers className="h-4 w-4 text-primary-blue" />
          <span className="text-sm font-semibold text-text-primary">{subject.name}</span>
          <Badge variant="blue">{subject.count}</Badge>
        </div>
        <span className="text-xs text-text-muted">
          {subject.topics.length} topic{subject.topics.length !== 1 ? "s" : ""}
        </span>
      </button>
      {expanded && (
        <div className="border-t border-card-border bg-gray-50/50 px-4 py-3">
          <div className="space-y-2">
            {subject.topics.map((topic) => (
              <div key={topic.name} className="rounded-lg border border-card-border bg-white">
                <button
                  onClick={() => toggleTopic(topic.name)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">›</span>
                    <span className="text-sm text-text-secondary">{topic.name}</span>
                    <Badge variant="gray">{topic.count}</Badge>
                  </div>
                  <span className="text-xs text-text-muted">
                    {topic.subtopics.filter((s) => s.name).length} sub
                  </span>
                </button>
                {topicExpanded.has(topic.name) && topic.subtopics.some((s) => s.name) && (
                  <div className="flex flex-wrap gap-1.5 border-t border-card-border px-3 py-2">
                    {topic.subtopics
                      .filter((s) => s.name)
                      .map((st) => (
                        <Badge key={st.name} variant="neutral">
                          {st.name} ({st.count})
                        </Badge>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
