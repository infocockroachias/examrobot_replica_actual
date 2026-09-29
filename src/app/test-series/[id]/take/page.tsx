"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Clock,
  Send,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  EyeOff,
  Ban,
} from "lucide-react";
import Link from "next/link";
import { startTest } from "@/lib/api";
import type { QuestionDetail } from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type PaletteState = "not-visited" | "not-answered" | "answered" | "marked";

interface QuestionState {
  selected: number | null; // index into options, or null
  marked: boolean;
  visited: boolean;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function paletteState(qs: QuestionState): PaletteState {
  if (qs.marked) return "marked";
  if (qs.selected !== null) return "answered";
  if (qs.visited) return "not-answered";
  return "not-visited";
}

const stateColor: Record<PaletteState, string> = {
  answered: "bg-success-green text-white",
  "not-answered":
    "bg-danger-red text-white outline outline-1 outline-danger-red",
  marked: "bg-warning-amber text-white",
  "not-visited": "bg-gray-100 text-text-muted",
};

const stateIcon: Record<PaletteState, React.ReactNode> = {
  answered: <CheckCircle2 className="h-3 w-3" />,
  "not-answered": <AlertCircle className="h-3 w-3" />,
  marked: <Flag className="h-3 w-3" />,
  "not-visited": <EyeOff className="h-3 w-3" />,
};

function formatTime(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function TakeTestPage() {
  const params = useParams();
  const testId = Number(params?.id);

  const [questions, setQuestions] = useState<QuestionDetail[]>([]);
  const [states, setStates] = useState<QuestionState[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const durationSeconds = useMemo(() => {
    // Default 60 min if unknown; tests can carry duration_minutes in future.
    return 60 * 60;
  }, []);

  /* ---- load questions ---- */
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const qs = await startTest(testId);
        if (cancelled) return;
        setQuestions(qs);
        setStates(
          qs.map((_, i) => ({
            selected: null,
            marked: false,
            visited: i === 0,
          })),
        );
        setCurrent(0);
      } catch (e: unknown) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : "Failed to load test";
        setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (Number.isFinite(testId)) load();
    return () => {
      cancelled = true;
    };
  }, [testId]);

  /* ---- timer ---- */
  useEffect(() => {
    if (loading || submitted || questions.length === 0) return;
    const interval = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (next >= durationSeconds) {
          clearInterval(interval);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, submitted, questions.length, durationSeconds]);

  // Auto-submit when time runs out.
  const submittedRef = useRef(false);
  useEffect(() => {
    if (
      !submitted &&
      questions.length > 0 &&
      elapsed >= durationSeconds &&
      !submittedRef.current
    ) {
      submittedRef.current = true;
      setSubmitted(true);
    }
  }, [elapsed, durationSeconds, questions.length, submitted]);

  /* ---- mutations ---- */
  const patchCurrent = useCallback(
    (patch: Partial<QuestionState>) => {
      setStates((prev) =>
        prev.map((s, i) => (i === current ? { ...s, ...patch } : s)),
      );
    },
    [current],
  );

  const selectOption = useCallback(
    (optIndex: number) => {
      patchCurrent({ selected: optIndex, visited: true });
    },
    [patchCurrent],
  );

  const clearResponse = useCallback(() => {
    patchCurrent({ selected: null });
  }, [patchCurrent]);

  const toggleMark = useCallback(() => {
    setStates((prev) =>
      prev.map((s, i) =>
        i === current ? { ...s, marked: !s.marked } : s,
      ),
    );
  }, [current]);

  const jumpTo = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= questions.length) return;
      setStates((prev) =>
        prev.map((s, i) => (i === idx ? { ...s, visited: true } : s)),
      ),
      setCurrent(idx);
    },
    [questions.length],
  );

  const saveAndNext = useCallback(() => {
    if (current >= questions.length - 1) return;
    jumpTo(current + 1);
  }, [current, questions.length, jumpTo]);

  const goPrevious = useCallback(() => {
    if (current <= 0) return;
    jumpTo(current - 1);
  }, [current, jumpTo]);

  const submitTest = useCallback(() => {
    submittedRef.current = true;
    setSubmitted(true);
  }, []);

  /* ---- derived stats ---- */
  const stats = useMemo(() => {
    let answered = 0;
    let notAnswered = 0;
    let marked = 0;
    let notVisited = 0;
    for (const s of states) {
      const ps = paletteState(s);
      if (ps === "answered") answered++;
      else if (ps === "not-answered") notAnswered++;
      else if (ps === "marked") marked++;
      else notVisited++;
    }
    return { answered, notAnswered, marked, notVisited };
  }, [states]);

  /* ---- render ---- */
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-page-bg">
        <p className="text-sm text-text-muted">Loading test…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-page-bg">
        <Ban className="h-8 w-8 text-danger-red" />
        <p className="text-sm text-danger-red">{error}</p>
        <Link
          href="/test-series"
          className="rounded-lg border border-card-border px-4 py-1.5 text-sm font-medium text-text-secondary hover:bg-gray-50"
        >
          ← Back to Test Series
        </Link>
      </main>
    );
  }

  if (questions.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-page-bg">
        <p className="text-sm text-text-muted">
          This test has no questions yet.
        </p>
        <Link
          href="/test-series"
          className="rounded-lg border border-card-border px-4 py-1.5 text-sm font-medium text-text-secondary hover:bg-gray-50"
        >
          ← Back to Test Series
        </Link>
      </main>
    );
  }

  /* ---- submitted: results summary ---- */
  if (submitted) {
    let correct = 0;
    let attempted = 0;
    const total = questions.length;
    questions.forEach((q, i) => {
      const sel = states[i].selected;
      if (sel === null) return;
      attempted++;
      // OptionOut uses is_correct; find the selected option's flag.
      const opt = q.options[sel];
      // The start endpoint returns OptionOutWithAnswer shape (label/text/is_correct).
      if (opt && (opt as { is_correct?: boolean }).is_correct) correct++;
    });
    const marksPerQuestion = 2;
    const totalMarks = total * marksPerQuestion;
    const negativeMarking = 0.66;
    const obtained =
      correct * marksPerQuestion - (attempted - correct) * negativeMarking;
    const pct = totalMarks > 0 ? (obtained / totalMarks) * 100 : 0;

    return (
      <main className="min-h-screen bg-page-bg">
        <div className="bg-navbar-bg px-6 py-4">
          <div className="mx-auto max-w-[900px]">
            <h1 className="text-xl font-bold text-white">Test Submitted</h1>
            <p className="text-sm text-gray-400">
              Here is your score summary.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-[900px] px-6 py-8">
          <div className="grid gap-4 sm:grid-cols-4">
            <Stat value={String(total)} label="Total Questions" />
            <Stat value={String(attempted)} label="Attempted" />
            <Stat value={String(correct)} label="Correct" c="text-success-green" />
            <Stat
              value={`${pct.toFixed(1)}%`}
              label="Score"
              c="text-primary-blue"
            />
          </div>
          <div className="mt-6 rounded-xl border border-card-border bg-white p-5">
            <p className="text-sm text-text-secondary">
              Marks obtained:{" "}
              <span className="font-bold text-text-primary">
                {obtained.toFixed(2)} / {totalMarks.toFixed(2)}
              </span>{" "}
              ({marksPerQuestion} per correct, −{negativeMarking} per wrong
              answer, unattempted = 0).
            </p>
          </div>
          <div className="mt-6">
            <Link
              href="/test-series"
              className="rounded-lg bg-primary-blue px-5 py-2 text-sm font-semibold text-white hover:bg-primary-blue-dark"
            >
              ← Back to Test Series
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* ---- active test ---- */
  const q = questions[current];
  const qs = states[current];
  const curState = paletteState(qs);
  const remaining = Math.max(0, durationSeconds - elapsed);

  return (
    <main className="min-h-screen bg-page-bg">
      {/* Top bar */}
      <div className="bg-navbar-bg px-6 py-2.5">
        <div className="mx-auto flex max-w-[1300px] items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-primary-blue">
              <span className="h-2 w-2 rounded-full bg-primary-blue" />
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-white">
              APPROACHES
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-white">
            <span className="text-text-muted">
              Test {testId} — {q.subject}
            </span>
            <span>
              {current + 1}/{questions.length}
            </span>
            <span
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                remaining < 300
                  ? "bg-danger-bg text-danger-red"
                  : "bg-white/10 text-white"
              }`}
            >
              <Clock className="h-3 w-3" />
              {formatTime(remaining)}
            </span>
            <button
              onClick={submitTest}
              className="flex items-center gap-1 rounded-lg bg-danger-red px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
            >
              <Send className="h-3 w-3" />
              Submit
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1300px] gap-6 px-6 py-6">
        {/* Main question area */}
        <div className="min-w-0 flex-1">
          <div className="rounded-xl border border-card-border bg-white p-5">
            {/* Top row */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary-blue px-3 py-1 text-xs font-bold text-white">
                  Q{current + 1}
                </span>
                <span className="text-xs text-text-muted">2.00 Marks</span>
                <span className="text-xs text-text-muted">•</span>
                <span className="text-xs capitalize text-text-muted">
                  {q.topic}
                </span>
              </div>
              <button
                onClick={toggleMark}
                className={`flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium ${
                  qs.marked
                    ? "border-warning-amber bg-warning-bg text-warning-amber"
                    : "border-card-border text-text-secondary hover:bg-gray-50"
                }`}
              >
                <Flag className="h-3.5 w-3.5" />
                {qs.marked ? "Marked for Review" : "Mark for Review"}
              </button>
            </div>

            {/* Stem */}
            <div className="whitespace-pre-line text-sm font-semibold text-text-primary">
              {q.question_text}
            </div>

            {/* Options */}
            <div className="mt-4 space-y-2">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => selectOption(i)}
                  className={`flex w-full items-center gap-3 rounded-lg border px-4 py-2.5 text-left text-sm transition-colors ${
                    qs.selected === i
                      ? "border-primary-blue bg-blue-50"
                      : "border-card-border hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                      qs.selected === i
                        ? "border-primary-blue bg-primary-blue text-white"
                        : "border-card-border text-text-secondary"
                    }`}
                  >
                    {opt.label}
                  </span>
                  <span className="text-text-primary">{opt.text}</span>
                </button>
              ))}
            </div>

            {/* Bottom row */}
            <div className="mt-5 flex items-center justify-between">
              <button
                onClick={clearResponse}
                disabled={qs.selected === null}
                className="flex items-center gap-1 rounded-lg border border-card-border px-4 py-2 text-xs font-medium text-text-secondary hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCcw className="h-3 w-3" />
                Clear
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={goPrevious}
                  disabled={current === 0}
                  className="flex items-center gap-1 rounded-lg border border-card-border px-4 py-2 text-xs font-medium text-text-secondary hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </button>
                <button
                  onClick={saveAndNext}
                  disabled={current >= questions.length - 1}
                  className="flex items-center gap-1 rounded-lg bg-primary-blue px-4 py-2 text-xs font-semibold text-white hover:bg-primary-blue-dark disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Save & Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              n={stats.answered}
              label="Answered"
              c="text-success-green"
            />
            <StatCard
              n={stats.notAnswered}
              label="Not Answered"
              c="text-danger-red"
            />
            <StatCard
              n={stats.marked}
              label="Marked"
              c="text-warning-amber"
            />
            <StatCard
              n={stats.notVisited}
              label="Not Visited"
              c="text-text-muted"
            />
          </div>
        </div>

        {/* Right sidebar — Question Palette */}
        <div className="w-[260px] shrink-0">
          <div className="rounded-xl border border-card-border bg-white p-4">
            <h3 className="mb-3 text-sm font-bold text-text-primary">
              Question Palette
            </h3>
            {/* Legend */}
            <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1.5 text-[10px] text-text-secondary">
              {(
                [
                  ["answered", "Answered"],
                  ["not-answered", "Not Answered"],
                  ["not-visited", "Not Visited"],
                  ["marked", "Marked"],
                ] as const
              ).map(([key, label]) => (
                <span key={key} className="flex items-center gap-1">
                  <span
                    className={`flex h-3.5 w-3.5 items-center justify-center rounded-sm ${stateColor[key]}`}
                  >
                    {stateIcon[key]}
                  </span>
                  {label}
                </span>
              ))}
            </div>
            {/* Grid */}
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((_, i) => {
                const ps = paletteState(states[i]);
                const isCurrent = i === current;
                return (
                  <button
                    key={i}
                    onClick={() => jumpTo(i)}
                    className={`flex h-8 items-center justify-center rounded text-[11px] font-medium transition-all ${stateColor[ps]} ${
                      isCurrent
                        ? "ring-2 ring-primary-blue ring-offset-1"
                        : ""
                    }`}
                    title={`Q${i + 1} — ${ps.replace("-", " ")}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Stat({
  value,
  label,
  c = "text-text-primary",
}: {
  value: string;
  label: string;
  c?: string;
}) {
  return (
    <div className="rounded-xl border border-card-border bg-white px-4 py-3 text-center">
      <p className={`text-xl font-bold ${c}`}>{value}</p>
      <p className="text-[10px] text-text-muted">{label}</p>
    </div>
  );
}

function StatCard({
  n,
  label,
  c,
}: {
  n: number;
  label: string;
  c: string;
}) {
  return (
    <div className="rounded-lg border border-card-border bg-white px-4 py-3 text-center">
      <p className={`text-xl font-bold ${c}`}>{n}</p>
      <p className="text-[10px] text-text-muted">{label}</p>
    </div>
  );
}
