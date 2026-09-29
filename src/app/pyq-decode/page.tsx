"use client";

import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import FilterSidebar from "@/components/FilterSidebar";
import QuestionCard from "@/components/QuestionCard";
import { Badge } from "@/components/Badge";
import { getExams, getYears, getQuestions, getQuestion } from "@/lib/api";
import type { Exam, Year, Question, QuestionDetail } from "@/lib/types";
import { Search, ChevronLeft, CheckCircle2, XCircle } from "lucide-react";

export default function PYQExplorerPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [years, setYears] = useState<Year[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedExams, setSelectedExams] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<QuestionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Load exams and years on mount
  useEffect(() => {
    getExams().then(setExams).catch(console.error);
    getYears().then(setYears).catch(console.error);
  }, []);

  // Load questions whenever filters change
  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getQuestions({
        exam_ids: selectedExams.length
          ? exams.filter((e) => selectedExams.includes(e.name)).map((e) => e.id)
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
      setLoading(false);
    }
  }, [selectedExams, selectedYears, search, exams]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleReset = () => {
    setSelectedExams([]);
    setSelectedYears([]);
    setSearch("");
  };

  const handleQuestionClick = async (id: number) => {
    setDetailLoading(true);
    try {
      const q = await getQuestion(id);
      setDetail(q);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const examGroup = {
    name: "Exam",
    options: exams.map((e) => ({ label: e.name, count: e.question_count })),
  };

  const yearGroup = {
    name: "Year",
    options: years.map((y) => ({ label: String(y.year), count: y.question_count })),
  };

  return (
    <main className="min-h-screen bg-page-bg">
      <Navbar authState="logged-in" username="Aspirant" variant="app" />

      <div className="mx-auto flex max-w-[1300px] gap-6 px-6 py-6">
        {/* Sidebar */}
        <div className="w-[260px] shrink-0 space-y-4">
          <FilterSidebar
            groups={[examGroup]}
            showReset={selectedExams.length > 0 || selectedYears.length > 0 || search !== ""}
            onReset={handleReset}
            selected={selectedExams}
            onChange={setSelectedExams}
          />
          <FilterSidebar
            groups={[yearGroup]}
            selected={selectedYears}
            onChange={setSelectedYears}
          />
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          {/* Search bar */}
          <div className="mb-4 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search questions (e.g. monsoon, GST, plateau)..."
                className="w-full rounded-lg border border-card-border bg-white py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-primary-blue focus:outline-none"
              />
            </div>
            <span className="text-xs text-text-muted">
              {loading ? "Loading…" : `${questions.length} question${questions.length !== 1 ? "s" : ""}`}
            </span>
          </div>

          {/* Question list */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-xl border border-card-border bg-white p-5">
                  <div className="mb-3 h-5 w-32 rounded bg-gray-200" />
                  <div className="space-y-2">
                    <div className="h-4 w-full rounded bg-gray-100" />
                    <div className="h-4 w-3/4 rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : questions.length === 0 ? (
            <div className="rounded-xl border border-card-border bg-white p-10 text-center">
              <p className="text-sm text-text-muted">
                No questions match your filters. Try clearing some filters or searching a different term.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q) => (
                <QuestionCard
                  key={q.id}
                  id={q.id}
                  exam={q.exam_name}
                  year={q.year}
                  questionNumber={q.question_number}
                  stem={q.question_text}
                  options={q.options.map((o) => ({
                    label: o.label,
                    text: o.option_text,
                    is_correct: o.is_correct,
                  }))}
                  onCardClick={() => handleQuestionClick(q.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail slide-over */}
      {detail && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setDetail(null)}
          />
          <div className="relative h-full w-full max-w-2xl overflow-y-auto bg-page-bg p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => setDetail(null)}
                className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to list
              </button>
            </div>

            {detailLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-6 w-48 rounded bg-gray-200" />
                <div className="h-20 w-full rounded bg-gray-100" />
              </div>
            ) : (
              <>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge variant="blue">
                    {detail.exam_name} · {detail.year} · Q{detail.question_number}
                  </Badge>
                  <Badge variant="green">✓ Official Key</Badge>
                </div>

                <p className="text-sm font-semibold text-text-primary">
                  {detail.question_text}
                </p>

                <div className="mt-4 space-y-2">
                  {detail.options.map((opt) => (
                    <div
                      key={opt.label}
                      className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 text-sm ${
                        opt.is_correct
                          ? "border-success-green/40 bg-success-bg"
                          : "border-card-border"
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          opt.is_correct
                            ? "bg-success-green text-white"
                            : "border border-card-border text-text-secondary"
                        }`}
                      >
                        {opt.label}
                      </span>
                      <span className="text-text-primary">{opt.text}</span>
                      {opt.is_correct && (
                        <CheckCircle2 className="ml-auto h-4 w-4 text-success-green" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-lg bg-success-bg p-3 text-sm text-success-green">
                  <strong>Correct answer: {detail.options.find((o) => o.is_correct)?.label}</strong>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
