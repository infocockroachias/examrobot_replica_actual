"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  Flame,
  Info,
  Lock,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Badge, Pill } from "@/components/Badge";
import Navbar from "@/components/Navbar";
import QuestionCard from "@/components/QuestionCard";
import { getPattern } from "@/lib/api";
import type {
  PatternCategoriesResponse,
  PatternClassification,
  PatternDetail,
  PatternListItem,
  PatternsListResponse,
} from "@/lib/types";

const CLASSIFICATIONS: {
  key: PatternClassification;
  label: string;
  badgeVariant: "red" | "amber" | "green" | "gray" | "purple";
  dot: string;
  blurb: string;
}[] = [
  {
    key: "hot",
    label: "Hot",
    badgeVariant: "red",
    dot: "bg-danger-red",
    blurb: "Tested heavily and appearing recently — highest priority.",
  },
  {
    key: "rising",
    label: "Rising",
    badgeVariant: "amber",
    dot: "bg-warning-amber",
    blurb: "Concentrated in recent years — momentum is building.",
  },
  {
    key: "evergreen",
    label: "Evergreen",
    badgeVariant: "green",
    dot: "bg-success-green",
    blurb: "Wide, consistent span — a perennial favourite.",
  },
  {
    key: "sporadic",
    label: "Sporadic",
    badgeVariant: "gray",
    dot: "bg-text-secondary",
    blurb: "Occasional appearances — low priority but not negligible.",
  },
  {
    key: "fading",
    label: "Fading",
    badgeVariant: "purple",
    dot: "bg-text-muted",
    blurb: "Absent in recent years — historically present but cooling off.",
  },
];

function clsConfig(key: PatternClassification) {
  return CLASSIFICATIONS.find((c) => c.key === key) ?? CLASSIFICATIONS[3];
}

interface Props {
  categories: PatternCategoriesResponse;
  patterns: PatternsListResponse;
}

export default function PatternXrayClient({ categories, patterns }: Props) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    number | undefined
  >(undefined);
  const [activeFilter, setActiveFilter] = useState<PatternClassification | "all">(
    "all",
  );
  const [selectedPatternId, setSelectedPatternId] = useState<number | null>(
    null,
  );
  const [detail, setDetail] = useState<PatternDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Filtered list: category (from dropdown) + classification (from chips).
  const filtered = useMemo(() => {
    return patterns.patterns.filter((p) => {
      if (selectedCategoryId !== undefined && p.category_id !== selectedCategoryId)
        return false;
      if (activeFilter !== "all" && p.classification !== activeFilter)
        return false;
      return true;
    });
  }, [patterns.patterns, selectedCategoryId, activeFilter]);

  // Classification counts over the current category selection.
  const counts = useMemo(() => {
    const base = patterns.patterns.filter(
      (p) =>
        selectedCategoryId === undefined || p.category_id === selectedCategoryId,
    );
    const byCls: Record<PatternClassification, number> = {
      hot: 0,
      rising: 0,
      evergreen: 0,
      sporadic: 0,
      fading: 0,
    };
    base.forEach((p) => {
      byCls[p.classification] += 1;
    });
    return { total: base.length, byCls };
  }, [patterns.patterns, selectedCategoryId]);

  // Default selection: first pattern of the filtered list.
  const selectedPattern: PatternListItem | undefined = useMemo(
    () => filtered.find((p) => p.id === selectedPatternId) ?? filtered[0],
    [filtered, selectedPatternId],
  );

  // Fetch detail (brief + timeline + practice) when selection changes.
  useEffect(() => {
    if (!selectedPattern) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getPattern(selectedPattern.id)
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedPattern]);

  const selectedCategoryName =
    selectedCategoryId === undefined
      ? "All Categories"
      : categories.categories.find((c) => c.id === selectedCategoryId)?.name ??
        "All Categories";

  const detailCls = detail ? clsConfig(detail.classification) : null;

  return (
    <main className="min-h-screen bg-page-bg">
      <Navbar authState="logged-in" username="Aspirant" variant="app" />

      {/* Top bar */}
      <div className="border-b border-card-border bg-white px-6 py-4">
        <div className="mx-auto flex max-w-[1300px] flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-text-primary">
              Pattern X-Ray
            </h1>
            {/* Category dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-1 rounded-lg border border-card-border bg-white px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-gray-50"
              >
                {selectedCategoryName} ({counts.total})
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute left-0 top-full z-20 mt-1 w-56 overflow-hidden rounded-lg border border-card-border bg-white py-1 shadow-lg">
                    <button
                      onClick={() => {
                        setSelectedCategoryId(undefined);
                        setDropdownOpen(false);
                      }}
                      className={`flex w-full items-center px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                        selectedCategoryId === undefined
                          ? "font-semibold text-primary-blue"
                          : "text-text-secondary"
                      }`}
                    >
                      All Categories ({patterns.patterns.length})
                    </button>
                    {categories.categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedCategoryId(c.id);
                          setDropdownOpen(false);
                        }}
                        className={`flex w-full items-center px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                          selectedCategoryId === c.id
                            ? "font-semibold text-primary-blue"
                            : "text-text-secondary"
                        }`}
                      >
                        {c.name} ({c.pattern_count})
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <Flame className="h-3.5 w-3.5 text-danger-red" />
              {counts.byCls.hot} hot
            </span>
            <span>{counts.total} patterns</span>
            <span>{patterns.patterns.length} total</span>
          </div>
        </div>

        {/* Classification filter chips */}
        <div className="mx-auto mt-4 flex max-w-[1300px] flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveFilter("all")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              activeFilter === "all"
                ? "bg-navbar-bg text-white"
                : "bg-white text-text-secondary hover:bg-gray-100"
            }`}
          >
            All {counts.total}
          </button>
          {CLASSIFICATIONS.map((c) => (
            <button
              key={c.key}
              onClick={() => setActiveFilter(c.key)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                activeFilter === c.key
                  ? "bg-navbar-bg text-white"
                  : "bg-white text-text-secondary hover:bg-gray-100"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
              {c.label} {counts.byCls[c.key]}
            </button>
          ))}
          <div className="ml-1 flex items-center gap-1.5 text-xs text-text-muted">
            <Info className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {activeFilter === "all"
                ? "Showing every classification"
                : clsConfig(activeFilter).blurb}
            </span>
          </div>
        </div>
      </div>

      {/* 2-col layout */}
      <div className="mx-auto flex max-w-[1300px] gap-6 px-6 py-6">
        {/* Left: pattern list */}
        <div className="w-[300px] shrink-0">
          <div className="thin-scroll max-h-[calc(100vh-220px)] space-y-2 overflow-y-auto rounded-xl border border-card-border bg-white p-3">
            {filtered.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-text-muted">
                No patterns match this filter.
              </p>
            ) : (
              filtered.map((p) => {
                const cfg = clsConfig(p.classification);
                const isActive = selectedPattern?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPatternId(p.id)}
                    className={`flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors ${
                      isActive
                        ? "border border-indigo-accent bg-indigo-50/40"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <span
                      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${cfg.dot}`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <Pill variant={cfg.badgeVariant}>{p.title}</Pill>
                      </div>
                      <p className="text-xs leading-snug text-text-secondary">
                        {p.question_count} Qs · {p.year_min}–{p.year_max}
                      </p>
                      <p className="mt-0.5 text-[10px] text-text-muted">
                        Score {p.tested_score} · {p.exams_covered.join(", ")}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: detail */}
        <div className="min-w-0 flex-1 space-y-5">
          {!selectedPattern ? (
            <div className="rounded-xl border border-card-border bg-white p-10 text-center text-sm text-text-muted">
              Select a pattern to see its strategic brief, timeline, and
              practice questions.
            </div>
          ) : loading ? (
            <div className="space-y-5">
              <div className="h-6 w-2/3 animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-24 animate-pulse rounded-xl bg-gray-100"
                  />
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-danger-red/30 bg-danger-bg p-5 text-sm text-danger-red">
              Failed to load this pattern&apos;s detail: {error}. The brief is
              generated on first view — try refreshing.
            </div>
          ) : detail ? (
            <>
              {/* Header */}
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {detailCls && (
                    <Badge variant={detailCls.badgeVariant}>
                      {detailCls.label}
                    </Badge>
                  )}
                  <h2 className="text-lg font-bold text-text-primary">
                    {detail.title}
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                  <span className="rounded-full bg-warning-bg px-2.5 py-0.5 font-medium text-warning-amber">
                    Score {detail.tested_score}
                  </span>
                  <span>{detail.question_count} questions</span>
                  <span>
                    {detail.year_min}–{detail.year_max}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {detail.exams_covered.map((e) => (
                      <Badge key={e} variant="neutral">
                        {e}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Strategic Brief */}
              <div className="rounded-xl border border-card-border bg-white p-5">
                <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary-blue">
                  <Sparkles className="h-3.5 w-3.5" />
                  Strategic Brief
                </h3>

                {detail.why_upsc_tests_this && (
                  <>
                    <h4 className="mb-1 text-xs font-semibold text-text-primary">
                      Why UPSC Tests This
                    </h4>
                    <p className="mb-4 text-sm text-text-secondary">
                      {detail.why_upsc_tests_this}
                    </p>
                  </>
                )}

                {detail.how_it_evolved && (
                  <>
                    <h4 className="mb-1 text-xs font-semibold text-text-primary">
                      How It Evolved
                    </h4>
                    <p className="mb-4 text-sm text-text-secondary">
                      {detail.how_it_evolved}
                    </p>
                  </>
                )}

                {detail.key_insight && (
                  <div className="rounded-lg bg-success-bg p-3 text-sm text-success-green">
                    <strong>KEY INSIGHT:</strong> {detail.key_insight}
                  </div>
                )}

                {!detail.generated_at && (
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-text-muted">
                    <Lock className="h-3 w-3" />
                    Brief generated on first view.
                  </p>
                )}
              </div>

              {/* Exam Timeline */}
              {detail.exam_timeline.length > 0 && (
                <div className="rounded-xl border border-card-border bg-white p-5">
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Exam Timeline
                  </h3>
                  <div className="space-y-2">
                    {detail.exam_timeline.map((t, i) => (
                      <div
                        key={`${t.year}-${t.exam_name}-${i}`}
                        className="flex items-center gap-3 text-sm"
                      >
                        <span className="h-2 w-2 shrink-0 rounded-full bg-danger-red" />
                        <span className="w-12 font-medium text-text-primary">
                          {t.year}
                        </span>
                        <span className="text-text-secondary">
                          {t.exam_name}
                        </span>
                        <span className="text-xs text-text-muted">
                          {t.question_count} Q
                          {t.question_count > 1 ? "s" : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Practice */}
              {detail.practice_questions.length > 0 && (
                <div className="rounded-xl border border-card-border bg-white p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
                      <Flame className="h-3.5 w-3.5 text-warning-amber" />
                      Practice (easy → hard)
                    </h3>
                    <span className="text-xs font-medium text-text-muted">
                      {detail.practice_questions.length} questions
                    </span>
                  </div>
                  <div className="space-y-4">
                    {detail.practice_questions.map((q) => (
                      <QuestionCard
                        key={q.id}
                        id={q.id}
                        exam={q.exam_name}
                        year={q.year}
                        questionNumber={q.question_number}
                        subject={q.subject}
                        subjectBreadcrumb={[q.topic, q.subtopic]
                          .filter(Boolean)
                          .join(" › ")}
                        stem={q.question_text}
                        options={q.options.map((o) => ({
                          label: o.label,
                          text: o.text,
                          is_correct: o.is_correct,
                        }))}
                        showAnalyzeLink
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}
