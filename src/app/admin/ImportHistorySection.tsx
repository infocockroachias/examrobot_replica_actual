"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import { Badge } from "@/components/Badge";
import { ImportBatch } from "@/lib/types";
import { getImportBatch, getImportHistory } from "@/lib/api";

export default function ImportHistorySection() {
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [batchDetail, setBatchDetail] = useState<ImportBatch | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getImportHistory(50)
      .then(setBatches)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const toggleExpand = async (batch: ImportBatch) => {
    if (expandedId === batch.id) {
      setExpandedId(null);
      setBatchDetail(null);
      return;
    }
    setExpandedId(batch.id);
    setBatchDetail(null);
    // Fetch the full batch (includes committed_question_ids).
    try {
      const detail = await getImportBatch(batch.id);
      setBatchDetail(detail);
    } catch {
      setBatchDetail(batch);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Import History</h1>
          <p className="mt-1 text-sm text-text-muted">
            Recent bulk-import batches and their outcomes.
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

      <div className="mt-4 overflow-hidden rounded-xl border border-card-border bg-white">
        <div className="thin-scroll overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-card-border bg-gray-50 text-xs uppercase tracking-wider text-text-muted">
              <tr>
                <th className="px-4 py-3">Batch</th>
                <th className="px-4 py-3">File</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Parsed</th>
                <th className="px-4 py-3">Committed</th>
                <th className="px-4 py-3">Dupes</th>
                <th className="px-4 py-3">Review</th>
                <th className="px-4 py-3">Invalid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-text-muted">
                    Loading…
                  </td>
                </tr>
              ) : batches.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-text-muted">
                    No imports yet. Use <strong>Bulk Import</strong> to get started.
                  </td>
                </tr>
              ) : (
                batches.map((b) => (
                  <>
                    <tr
                      key={b.id}
                      className="hover:bg-gray-50/50 cursor-pointer"
                      onClick={() => toggleExpand(b)}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-text-muted">
                        <div className="flex items-center gap-1.5">
                          {expandedId === b.id ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                          #{b.id}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-text-muted" />
                          <span className="max-w-[200px] truncate text-text-primary">{b.filename}</span>
                        </div>
                      </td>
                      <td className="max-w-[180px] truncate px-4 py-3 text-text-secondary">
                        {b.source_document ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-text-muted">
                        {new Date(b.uploaded_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-text-primary">{b.total_parsed}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-success-green">{b.committed_count}</span>
                      </td>
                      <td className="px-4 py-3">
                        {b.duplicate_count > 0 ? (
                          <Badge variant="amber">{b.duplicate_count}</Badge>
                        ) : (
                          <span className="text-text-muted">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {b.needs_review_count > 0 ? (
                          <Badge variant="amber">{b.needs_review_count}</Badge>
                        ) : (
                          <span className="text-text-muted">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {b.invalid_count > 0 ? (
                          <Badge variant="red">{b.invalid_count}</Badge>
                        ) : (
                          <span className="text-text-muted">0</span>
                        )}
                      </td>
                    </tr>
                    {expandedId === b.id && (
                      <tr key={`${b.id}-detail`}>
                        <td colSpan={9} className="bg-gray-50/50 px-4 py-3">
                          <BatchQuestionIds
                            batch={batchDetail || b}
                            loading={!batchDetail}
                          />
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function BatchQuestionIds({ batch, loading }: { batch: ImportBatch; loading: boolean }) {
  const ids = batch.committed_question_ids ?? [];

  if (loading) {
    return <p className="text-xs text-text-muted">Loading question IDs…</p>;
  }

  if (ids.length === 0) {
    return (
      <p className="text-xs text-text-muted">
        No questions committed from this batch (all were skipped or invalid).
      </p>
    );
  }

  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-text-muted">
        Committed question IDs ({ids.length}) — click to view in Questions tab:
      </p>
      <div className="flex flex-wrap gap-1.5">
        {ids.map((id) => (
          <a
            key={id}
            href={`#/questions?id=${id}`}
            onClick={(e) => {
              e.preventDefault();
              // Navigate to questions section and scroll/highlight.
              // The admin page is a single client component, so we use a custom event.
              window.dispatchEvent(
                new CustomEvent("admin:navigate", { detail: { section: "questions", questionId: id } }),
              );
            }}
            className="inline-flex h-7 min-w-[32px] items-center justify-center rounded-md border border-card-border bg-white px-2 text-xs font-mono text-primary-blue hover:bg-primary-blue hover:text-white transition-colors"
          >
            {id}
          </a>
        ))}
      </div>
    </div>
  );
}
