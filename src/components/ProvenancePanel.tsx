"use client";

import { useState } from "react";
import Tabs from "@/components/Tabs";
import { Badge } from "@/components/Badge";
import { Info } from "lucide-react";
import type { Provenance } from "@/lib/types";

interface ProvenancePanelProps {
  provenance: Provenance | null;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}

const FALLBACK = "—";

export default function ProvenancePanel({
  provenance,
  loading,
  error,
  onRetry,
}: ProvenancePanelProps) {
  const [activeTab, setActiveTab] = useState(0);

  // Build the dynamic tab list: Verdict, S1..Sn (one per statement), How to study,
  // Micro-concepts, THE VAULT.
  const statementCount = provenance?.statement_breakdown.length ?? 0;
  const tabLabels = [
    { label: "Verdict" },
    ...(provenance?.statement_breakdown.map((_, i) => ({ label: `S${i + 1}` })) ?? []),
    { label: "How to study" },
    { label: "Micro-concepts", count: provenance?.micro_concepts.length },
    { label: "THE VAULT" },
  ];

  const renderTabContent = () => {
    if (!provenance) return null;

    // Tab 0 = Verdict; tabs 1..statementCount = S1..Sn; then How to study, Micro-concepts, THE VAULT.
    if (activeTab === 0) {
      return (
        <p className="text-sm leading-relaxed text-text-primary">
          {provenance.verdict || FALLBACK}
        </p>
      );
    }
    if (activeTab >= 1 && activeTab <= statementCount) {
      const stmt = provenance.statement_breakdown[activeTab - 1];
      return (
        <div className="space-y-1">
          <p className="text-sm font-semibold text-text-primary">{stmt.statement}</p>
          <p className="text-sm text-text-secondary">{stmt.why_it_matters}</p>
        </div>
      );
    }
    if (activeTab === statementCount + 1) {
      return (
        <p className="text-sm leading-relaxed text-text-primary">
          {provenance.how_to_study || FALLBACK}
        </p>
      );
    }
    if (activeTab === statementCount + 2) {
      return (
        <ul className="list-inside list-disc space-y-1 text-sm text-text-secondary">
          {provenance.micro_concepts.length > 0 ? (
            provenance.micro_concepts.map((mc, i) => <li key={i}>{mc}</li>)
          ) : (
            <li>{FALLBACK}</li>
          )}
        </ul>
      );
    }
    // THE VAULT: purpose not yet defined, placeholder only
    return (
      <p className="text-sm italic text-text-muted">Coming soon.</p>
    );
  };

  return (
    <div className="mt-6 rounded-xl border border-card-border bg-purple-50/40 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-text-primary">
          Provenance & Study Pattern
        </h3>
      </div>

      <p className="mb-3 text-xs italic text-text-muted">
        Don&apos;t just practise — reverse-engineer the question. This panel shows where
        this PYQ likely came from, how the examiner broke it into hidden statements,
        and which nearby micro-concepts you were supposed to learn from it.
      </p>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-blue border-t-transparent" />
          Analyzing question pattern...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-danger-red/30 bg-danger-bg p-3">
          <p className="text-sm text-danger-red">
            Provenance generation failed, please retry.
          </p>
          <button
            onClick={onRetry}
            className="mt-2 text-sm font-medium text-primary-blue underline"
          >
            Retry
          </button>
        </div>
      ) : provenance ? (
        <div className="space-y-4">
          {/* AT A GLANCE */}
          <div className="rounded-lg bg-white p-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="purple">
                {provenance.origin_classification || FALLBACK}
              </Badge>
              <Badge variant="amber">
                {provenance.fairness_rating || FALLBACK}
              </Badge>
              <Badge variant="blue">
                {provenance.books_score ?? FALLBACK}/10 · {provenance.current_affairs_score ?? FALLBACK}/10
              </Badge>
            </div>
            <p className="mt-2 flex items-center gap-1 text-xs text-text-muted">
              <Info className="h-3 w-3 shrink-0" />
              These are AI-generated estimates, not verified metrics.
            </p>
          </div>

          {/* Tab bar */}
          <div className="rounded-lg bg-white p-3">
            <Tabs tabs={tabLabels} activeIndex={activeTab} onChange={setActiveTab} />
            <div className="mt-3">{renderTabContent()}</div>
          </div>

          {/* HOW THIS QUESTION IS BUILT */}
          <div className="rounded-lg bg-white p-3">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-text-muted">
              How this question is built
            </p>
            <div className="space-y-1.5">
              {provenance.statement_breakdown.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i + 1)}
                  className="block w-full rounded-md px-2 py-1.5 text-left text-sm text-text-secondary transition-colors hover:bg-primary-blue/[0.04] hover:text-primary-blue"
                >
                  <span className="mr-1.5 text-xs font-bold text-text-muted">S{i + 1}.</span>
                  {item.statement.length > 120
                    ? item.statement.slice(0, 117) + "…"
                    : item.statement}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
