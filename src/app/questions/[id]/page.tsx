"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/Badge";
import ProvenancePanel from "@/components/ProvenancePanel";
import {
  getQuestion,
  getQuestions,
  getSimilarQuestions,
  getProvenance,
  APIError,
} from "@/lib/api";
import type {
  Question,
  QuestionDetail,
  SimilarQuestion,
  Provenance,
} from "@/lib/types";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  CheckCircle2,
  XCircle,
  Lock,
} from "lucide-react";

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [question, setQuestion] = useState<QuestionDetail | null>(null);
  const [similar, setSimilar] = useState<SimilarQuestion[]>([]);
  const [provenance, setProvenance] = useState<Provenance | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [provenanceLoading, setProvenanceLoading] = useState(true);
  const [provenanceError, setProvenanceError] = useState(false);

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [paperQuestions, setPaperQuestions] = useState<Question[]>([]);

  // Fetch all three endpoints in parallel
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setNotFound(false);

    getQuestion(id)
      .then((q) => {
        setQuestion(q);
        setLoading(false);
      })
      .catch((err) => {
        if (err instanceof APIError && err.status === 404) {
          setNotFound(true);
        }
        setLoading(false);
      });

    getSimilarQuestions(id).then(setSimilar).catch(() => setSimilar([]));

    setProvenanceLoading(true);
    setProvenanceError(false);
    getProvenance(id)
      .then((p) => {
        setProvenance(p);
        setProvenanceLoading(false);
      })
      .catch(() => {
        setProvenanceError(true);
        setProvenanceLoading(false);
      });
  }, [id]);

  // Load sibling questions in the same paper (same exam + year) for prev/next nav.
  useEffect(() => {
    if (!question) return;
    getQuestions({ years: [question.year] })
      .then((qs) => {
        const siblings = qs
          .filter((q) => q.exam_name === question.exam_name)
          .sort((a, b) => a.question_number - b.question_number);
        setPaperQuestions(siblings);
      })
      .catch(() => setPaperQuestions([]));
  }, [question]);

  if (loading) {
    return (
      <main className="min-h-screen bg-page-bg">
        <Navbar authState="logged-in" username="Aspirant" variant="app" />
        <div className="mx-auto max-w-[1300px] px-6 py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-48 rounded bg-gray-200" />
            <div className="h-32 w-full rounded bg-gray-100" />
          </div>
        </div>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="min-h-screen bg-page-bg">
        <Navbar authState="logged-in" username="Aspirant" variant="app" />
        <div className="mx-auto max-w-[1300px] px-6 py-10 text-center">
          <p className="text-lg font-semibold text-text-primary">Question not found</p>
          <Link href="/pyq-decode" className="mt-4 inline-block text-sm text-primary-blue underline">
            ← Back to PYQ Explorer
          </Link>
        </div>
      </main>
    );
  }

  if (!question) return null;

  const correctOption = question.options.find((o) => o.is_correct);
  const answered = selectedOption !== null;

  // Prev/next within the same paper (sorted by question_number).
  const currentIndex = paperQuestions.findIndex((q) => q.id === question.id);
  const prevQuestion = currentIndex > 0 ? paperQuestions[currentIndex - 1] : null;
  const nextQuestion =
    currentIndex >= 0 && currentIndex < paperQuestions.length - 1
      ? paperQuestions[currentIndex + 1]
      : null;

  return (
    <main className="min-h-screen bg-page-bg">
      <Navbar authState="logged-in" username="Aspirant" variant="app" />

      {/* Top bar */}
      <div className="border-b border-card-border bg-purple-50/50 px-6 py-2.5">
        <div className="mx-auto flex max-w-[1300px] flex-wrap items-center gap-3 text-sm">
          <span className="text-text-muted">Current set</span>
          <span className="font-bold text-text-primary">
            {question.exam_name} · {question.year}
          </span>
          <span className="font-bold text-text-primary">Q{question.question_number}</span>
          <div className="flex items-center gap-1">
            <button
              disabled={!prevQuestion}
              onClick={() => prevQuestion && router.push(`/questions/${prevQuestion.id}`)}
              className="rounded border border-card-border p-1 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              disabled={!nextQuestion}
              onClick={() => nextQuestion && router.push(`/questions/${nextQuestion.id}`)}
              className="rounded border border-card-border p-1 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setBookmarked(!bookmarked)}
              className="flex items-center gap-1 rounded-lg border border-card-border bg-white px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-gray-50"
            >
              <Star className={`h-3.5 w-3.5 ${bookmarked ? "fill-warning-amber text-warning-amber" : ""}`} />
              Review
            </button>
            <button
              className="rounded-lg border border-card-border bg-white px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-gray-50"
            >
              RLE
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1300px] gap-6 px-6 py-6">
        {/* Main column */}
        <div className="min-w-0 flex-1">
          {/* Tag pills */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="blue">
              {question.exam_name} · {question.year} · Q{question.question_number}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-text-muted">
              {question.subject} <span>›</span> {question.topic}
              {question.subtopic && (
                <>
                  <span>›</span> {question.subtopic}
                </>
              )}
            </span>
            <Badge variant="green">✓ Official Key</Badge>
          </div>

          {/* Question text */}
          <p className="text-sm font-semibold text-text-primary">
            {question.question_text}
          </p>

          {/* Options */}
          <div className="mt-4 space-y-2">
            {question.options.map((opt) => {
              const isSelected = selectedOption === opt.label;
              const showCorrect = answered && opt.is_correct;
              const showWrong = answered && isSelected && !opt.is_correct;

              return (
                <button
                  key={opt.label}
                  onClick={() => !answered && setSelectedOption(opt.label)}
                  disabled={answered}
                  className={`flex w-full items-center gap-3 rounded-lg border px-4 py-2.5 text-sm text-left ${
                    showCorrect
                      ? "border-success-green/40 bg-success-bg"
                      : showWrong
                        ? "border-danger-red/40 bg-danger-bg"
                        : isSelected
                          ? "border-primary-blue/40 bg-primary-blue/5"
                          : "border-card-border hover:border-primary-blue/30"
                  } ${answered ? "cursor-default" : "cursor-pointer"}`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      showCorrect
                        ? "bg-success-green text-white"
                        : showWrong
                          ? "bg-danger-red text-white"
                          : "border border-card-border text-text-secondary"
                    }`}
                  >
                    {opt.label}
                  </span>
                  <span className="text-text-primary">{opt.text}</span>
                  {showCorrect && <CheckCircle2 className="ml-auto h-4 w-4 text-success-green" />}
                  {showWrong && <XCircle className="ml-auto h-4 w-4 text-danger-red" />}
                </button>
              );
            })}
          </div>

          {/* Pre-answer lock message */}
          {!answered && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-card-border bg-gray-50 px-4 py-3 text-sm text-text-muted">
              <Lock className="h-4 w-4" />
              Pick an answer to reveal the explanation
            </div>
          )}

          {/* Post-answer explanation */}
          {answered && (
            <div className="mt-4 rounded-xl border border-card-border bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-text-primary">Explanation</h3>
              <p className="text-sm text-text-secondary">
                Correct answer: <strong className="text-success-green">{correctOption?.label}</strong>
                {" — "}
                {correctOption?.text}
              </p>
              {selectedOption !== correctOption?.label && (
                <p className="mt-2 text-sm text-danger-red">
                  You selected {selectedOption}. The correct answer is {correctOption?.label}.
                </p>
              )}
            </div>
          )}

          {/* Provenance panel */}
          <ProvenancePanel
            provenance={provenance}
            loading={provenanceLoading}
            error={provenanceError}
            onRetry={() => {
              setProvenanceLoading(true);
              setProvenanceError(false);
              getProvenance(id)
                .then((p) => {
                  setProvenance(p);
                  setProvenanceLoading(false);
                })
                .catch(() => {
                  setProvenanceError(true);
                  setProvenanceLoading(false);
                });
            }}
          />
        </div>

        {/* Similar Questions sidebar */}
        <div className="hidden w-[320px] shrink-0 lg:block">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success-green" />
            <span className="text-sm font-bold text-text-primary">Similar Questions</span>
          </div>

          {similar.length === 0 ? (
            <p className="text-sm text-text-muted">No similar questions found yet</p>
          ) : (
            <div className="space-y-4">
              {similar.map((q) => (
                <Link key={q.id} href={`/questions/${q.id}`}>
                  <div className="rounded-xl border border-card-border bg-white p-4 transition-colors hover:border-primary-blue/40">
                    <div className="mb-2 flex items-center justify-between">
                      <Badge variant="blue">
                        {q.exam_name} · {q.year} · Q{q.question_number}
                      </Badge>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-text-muted">
                        {q.relevance_score}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-text-primary">{q.question_text}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
