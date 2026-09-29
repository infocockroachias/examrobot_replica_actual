"use client";

import { useState, useCallback, useEffect } from "react";
import Navbar from "@/components/Navbar";
import FilterSidebar from "@/components/FilterSidebar";
import QuestionCard from "@/components/QuestionCard";
import { Badge } from "@/components/Badge";
import { getExams, getQuestions, getTopicIntelligence, getYears } from "@/lib/api";
import type { Exam, Question, TopicIntelligence, Year } from "@/lib/types";
import Link from "next/link";
import { Search, RefreshCw, BookOpen } from "lucide-react";

type Classification =
  | "High-Frequency Goldmine"
  | "Occasional Topic"
  | "Rare Appearance"
  | "No Historical Data";

function classificationVariant(c: Classification) {
  switch (c) {
    case "High-Frequency Goldmine":
      return "red";
    case "Occasional Topic":
      return "amber";
    case "Rare Appearance":
      return "gray";
    default:
      return "neutral";
  }
}

function recommendationVariant(r: string) {
  switch (r) {
    case "master":
      return "red";
    case "study":
      return "blue";
    default:
      return "gray";
  }
}

function recommendationLabel(r: string) {
  switch (r) {
    case "master":
      return "Master";
    case "study":
      return "Study";
    default:
      return "Skim";
  }
}

export default function TopicIntelligencePage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [years, setYears] = useState<Year[]>([]);
  const [selectedExams, setSelectedExams] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);

  const [search, setSearch] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [listLoading, setListLoading] = useState(false);

  const [report, setReport] = useState<TopicIntelligence | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  // Load exam/year metadata for the filter sidebar.
  useEffect(() => {
    getExams().then(setExams).catch(console.error);
    getYears().then(setYears).catch(console.error);
  }, []);

  // Live-filter the supporting question list as the user types or toggles filters.
  const loadQuestions = useCallback(async () => {
    setListLoading(true);
    try {
      const result = await getQuestions({
        exam_ids: selectedExams.length
          ? exams
              .filter((e) => selectedExams.includes(e.name))
              .map((e) => e.id)
          : undefined,
        years: selectedYears.length
          ? selectedYears.map(Number)
          : undefined,
        search: search || undefined,
      });
      setQuestions(result);
    } catch (err) {
      console.error(err);
    } finally {
      setListLoading(false);
    }
  }, [search, selectedExams, selectedYears, exams]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleReset = () => {
    setSelectedExams([]);
    setSelectedYears([]);
  };

  const hasFilters = selectedExams.length > 0 || selectedYears.length > 0;

  // Run the intelligence report for the current search term.
  const runAnalysis = useCallback(async () => {
    const term = search.trim();
    if (!term) return;
    setHasAnalyzed(true);
    setReportError(false);
    setReportLoading(true);
    try {
      const result = await getTopicIntelligence(term);
      setReport(result);
    } catch (err) {
      console.error(err);
      setReportError(true);
      setReport(null);
    } finally {
      setReportLoading(false);
    }
  }, [search]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") runAnalysis();
  };

  return (
    <main className="min-h-screen bg-page-bg">
      <Navbar authState="logged-in" username="Aspirant" variant="app" />
      <div className="mx-auto max-w-[1300px] px-6 py-6">
        <div className="flex gap-6">
          {/* Left sidebar */}
          <div className="hidden w-[220px] shrink-0 space-y-4 lg:block">
            <FilterSidebar
              groups={[
                {
                  name: "Exam",
                  options: exams.map((e) => ({
                    label: e.name,
                    count: e.question_count,
                  })),
                },
              ]}
              showReset={hasFilters}
              onReset={handleReset}
              selected={selectedExams}
              onChange={setSelectedExams}
            />
            <FilterSidebar
              groups={[
                {
                  name: "Year",
                  options: years.map((y) => ({
                    label: String(y.year),
                    count: y.question_count,
                  })),
                },
              ]}
              selected={selectedYears}
              onChange={setSelectedYears}
            />
          </div>

          {/* Right main column */}
          <div className="min-w-0 flex-1">
            {/* Top bar */}
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-text-secondary">
                Researching any topic?
              </span>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a keyword or concept"
                  className="w-full rounded-lg border border-card-border bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-primary-blue focus:ring-1 focus:ring-primary-blue"
                />
              </div>
              <button
                onClick={runAnalysis}
                disabled={!search.trim() || reportLoading}
                className="rounded-lg gradient-primary px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                Analyze
              </button>
            </div>

            {/* ============================================================
                Topic Intelligence Report — appears above the question list
                ============================================================ */}
            {hasAnalyzed && (
              <div className="mb-6 rounded-xl border border-card-border bg-white p-6">
                {/* Loading state */}
                {reportLoading && (
                  <div className="flex items-center gap-3 py-4 text-text-secondary">
                    <RefreshCw className="h-5 w-5 animate-spin text-primary-blue" />
                    <span className="text-sm font-medium">
                      Scanning historical papers…
                    </span>
                  </div>
                )}

                {/* Error state */}
                {!reportLoading && reportError && (
                  <div className="flex flex-col items-start gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-danger-red">
                      Something went wrong generating the report. Please retry.
                    </p>
                    <button
                      onClick={runAnalysis}
                      className="flex items-center gap-1.5 rounded-lg border border-card-border px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-gray-50"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Retry
                    </button>
                  </div>
                )}

                {/* Report content */}
                {!reportLoading && !reportError && report && (
                  <>
                    {/* Header row: term + classification badge */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h2 className="text-lg font-bold text-text-primary">
                        {report.query}
                      </h2>
                      <Badge
                        variant={
                          classificationVariant(
                            report.frequency_classification as Classification,
                          ) as "red" | "amber" | "gray" | "neutral"
                        }
                      >
                        {report.frequency_classification}
                      </Badge>
                    </div>

                    {/* Key stats row */}
                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="rounded-lg border border-card-border p-3">
                        <div className="text-xs font-medium text-text-muted">
                          Total matches
                        </div>
                        <div className="mt-1 text-xl font-bold text-text-primary">
                          {report.total_matches}
                        </div>
                      </div>
                      <div className="rounded-lg border border-card-border p-3">
                        <div className="text-xs font-medium text-text-muted">
                          Years covered
                        </div>
                        <div className="mt-1 text-sm font-semibold text-text-primary">
                          {report.years_covered.length > 0
                            ? `${report.total_matches} question${
                                report.total_matches !== 1 ? "s" : ""
                              } across ${report.years_covered.length} year${
                                report.years_covered.length !== 1 ? "s" : ""
                              }: ${report.years_covered.join(", ")}`
                            : "—"}
                        </div>
                      </div>
                      <div className="rounded-lg border border-card-border p-3">
                        <div className="text-xs font-medium text-text-muted">
                          Exams covered
                        </div>
                        <div className="mt-1 text-sm font-semibold text-text-primary">
                          {report.exams_covered.length > 0
                            ? report.exams_covered.join(", ")
                            : "—"}
                        </div>
                      </div>
                    </div>

                    {/* Zero-match empty state */}
                    {report.total_matches === 0 && (
                      <div className="mt-5 rounded-lg border border-card-border bg-gray-50 p-4">
                        <p className="text-sm text-text-secondary">
                          No historical matches found for{" "}
                          <strong className="text-text-primary">
                            &ldquo;{report.query}&rdquo;
                          </strong>{" "}
                          in the current question bank. This may mean the topic
                          is genuinely rare, or that the question bank
                          doesn&rsquo;t yet cover it.
                        </p>
                      </div>
                    )}

                    {/* Recommendation + narrative + sub-areas (matches > 0) */}
                    {report.total_matches > 0 && (
                      <div className="mt-5">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-text-muted" />
                          <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
                            Recommendation
                          </span>
                          <Badge
                            variant={
                              recommendationVariant(
                                report.recommendation ?? "skim",
                              ) as "red" | "blue" | "gray"
                            }
                          >
                            {recommendationLabel(report.recommendation ?? "skim")}
                          </Badge>
                        </div>

                        {report.narrative && (
                          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                            {report.narrative}
                          </p>
                        )}

                        {report.subarea_breakdown.length > 0 && (
                          <div className="mt-4">
                            <div className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
                              Top sub-areas
                            </div>
                            <ol className="space-y-1.5">
                              {report.subarea_breakdown.map((area, i) => (
                                <li
                                  key={area.name}
                                  className="flex items-center justify-between rounded-lg border border-card-border px-3 py-2 text-sm"
                                >
                                  <span className="flex items-center gap-2 text-text-primary">
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-text-muted">
                                      {i + 1}
                                    </span>
                                    {area.name}
                                  </span>
                                  <span className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-text-secondary">
                                      {area.count}
                                    </span>
                                    <Link
                                      href={`/questions/${area.example_question_id}`}
                                      className="text-xs font-medium text-primary-blue underline hover:text-primary-blue-dark"
                                    >
                                      example →
                                    </Link>
                                  </span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Question cards (supporting evidence below the report) */}
            <div className="space-y-4">
              {questions.map((q) => (
                <QuestionCard
                  key={q.id}
                  id={q.id}
                  exam={q.exam_name}
                  year={q.year}
                  questionNumber={q.question_number}
                  subject=""
                  stem={q.question_text}
                  options={q.options.map((o) => ({
                    label: o.label,
                    text: o.option_text,
                    is_correct: o.is_correct,
                  }))}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
