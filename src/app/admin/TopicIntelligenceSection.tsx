"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/Badge";
import {
  clearTICache,
  deleteTICacheEntry,
  getTICache,
  TICacheEntry,
} from "@/lib/api";

export default function TopicIntelligenceSection() {
  const [rows, setRows] = useState<TICacheEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    getTICache()
      .then(setRows)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleClearAll = async () => {
    if (!window.confirm("Clear the entire Topic Intelligence cache?")) return;
    try {
      await clearTICache();
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTICacheEntry(id);
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Topic Intelligence</h1>
          <p className="mt-1 text-sm text-text-muted">
            Cached frequency analyses + LLM narratives. Add questions, then clear the cache to
            recompute.
          </p>
        </div>
        {rows.length > 0 && (
          <button
            onClick={handleClearAll}
            className="inline-flex items-center gap-1.5 rounded-lg border border-danger-red/30 bg-danger-bg px-3 py-2 text-sm font-medium text-danger-red hover:bg-danger-bg/80"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-danger-red/30 bg-danger-bg p-3 text-sm text-danger-red">
          {error}
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-xl border border-card-border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-card-border bg-gray-50 text-xs uppercase tracking-wider text-text-muted">
            <tr>
              <th className="px-4 py-3">Query</th>
              <th className="px-4 py-3">Matches</th>
              <th className="px-4 py-3">Frequency</th>
              <th className="px-4 py-3">Recommendation</th>
              <th className="px-4 py-3">Narrative</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                  No cached entries. The cache fills when a user searches a topic.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-text-primary">{r.query}</td>
                  <td className="px-4 py-3">{r.total_matches}</td>
                  <td className="px-4 py-3">
                    <Badge variant="blue">{r.frequency_classification}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {r.recommendation ? (
                      <Badge variant="green">{r.recommendation}</Badge>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {r.has_narrative ? (
                      <Badge variant="neutral">generated</Badge>
                    ) : (
                      <Badge variant="amber">pending</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="rounded-lg p-1.5 text-text-muted hover:bg-danger-bg hover:text-danger-red"
                      title="Delete entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
