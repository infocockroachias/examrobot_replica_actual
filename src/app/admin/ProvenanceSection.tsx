"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import { Badge } from "@/components/Badge";
import {
  deleteProvenance,
  getAdminProvenance,
  ProvenanceEntry,
  regenerateProvenance,
} from "@/lib/api";

export default function ProvenanceSection() {
  const [rows, setRows] = useState<ProvenanceEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getAdminProvenance()
      .then(setRows)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleRegenerate = async (questionId: number) => {
    setBusyId(questionId);
    setError(null);
    try {
      await regenerateProvenance(questionId);
      load();
    } catch (e) {
      setError(`Regeneration failed for question ${questionId}: ${(e as Error).message}`);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (questionId: number) => {
    try {
      await deleteProvenance(questionId);
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary">PYQ Deep Decode</h1>
      <p className="mt-1 text-sm text-text-muted">
        Per-question provenance (source guess, statement breakdown, fairness). Generated lazily by
        the LLM — regenerate or clear per question.
      </p>

      {error && (
        <div className="mt-4 rounded-xl border border-danger-red/30 bg-danger-bg p-3 text-sm text-danger-red">
          {error}
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-xl border border-card-border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-card-border bg-gray-50 text-xs uppercase tracking-wider text-text-muted">
            <tr>
              <th className="px-4 py-3">Question ID</th>
              <th className="px-4 py-3">Source Guess</th>
              <th className="px-4 py-3">Schema</th>
              <th className="px-4 py-3">Generated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                  No provenance cached yet. It generates when a user opens a question&apos;s decode
                  view.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.question_id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-text-primary">#{r.question_id}</td>
                  <td className="max-w-md truncate px-4 py-3 text-text-secondary">
                    {r.source_guess}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="neutral">v{r.schema_version}</Badge>
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {new Date(r.generated_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        disabled={busyId === r.question_id}
                        onClick={() => handleRegenerate(r.question_id)}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-text-secondary hover:bg-gray-100 hover:text-primary-blue disabled:opacity-50"
                        title="Regenerate"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${busyId === r.question_id ? "animate-spin" : ""}`} />
                        Regenerate
                      </button>
                      <button
                        onClick={() => handleDelete(r.question_id)}
                        className="rounded-lg p-1.5 text-text-muted hover:bg-danger-bg hover:text-danger-red"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
