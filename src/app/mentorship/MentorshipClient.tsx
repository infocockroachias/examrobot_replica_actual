"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CheckCircle2,
  Clock,
  MessageSquare,
  MessageSquarePlus,
  Send,
} from "lucide-react";
import { Badge } from "@/components/Badge";
import {
  MENTORSHIP_STATUSES,
  MentorshipQuestion,
  MentorshipStatus,
  createMentorship,
  getMentorship,
  getMyMentorship,
} from "@/lib/api";

const STATUS_META: Record<
  MentorshipStatus,
  { label: string; variant: "amber" | "blue" | "green"; icon: React.ReactNode }
> = {
  pending: { label: "Pending", variant: "amber", icon: <Clock className="h-3.5 w-3.5" /> },
  answered: { label: "Answered", variant: "blue", icon: <MessageSquare className="h-3.5 w-3.5" /> },
  resolved: { label: "Resolved", variant: "green", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
};

const MAX_QUESTION_LENGTH = 5000;
const STUDENT_NAME_KEY = "erm_student_name";

export default function MentorshipClient() {
  const [studentName, setStudentName] = useState("");
  const [nameLoaded, setNameLoaded] = useState(false);

  const [questions, setQuestions] = useState<MentorshipQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ask-a-doubt form.
  const [subject, setSubject] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Conversation view.
  const [activeId, setActiveId] = useState<number | null>(null);

  // Load persisted student name.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STUDENT_NAME_KEY);
      if (stored) setStudentName(stored);
    } catch {
      // ignore
    }
    setNameLoaded(true);
  }, []);

  const persistName = useCallback((name: string) => {
    setStudentName(name);
    try {
      localStorage.setItem(STUDENT_NAME_KEY, name);
    } catch {
      // ignore
    }
  }, []);

  const loadQuestions = useCallback(() => {
    setError(null);
    setLoading(true);
    getMyMentorship()
      .then(setQuestions)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (nameLoaded) loadQuestions();
  }, [nameLoaded, loadQuestions]);

  const handleSubmit = async () => {
    const text = questionText.trim();
    if (!text) {
      setError("Please describe your doubt before submitting.");
      return;
    }
    if (text.length > MAX_QUESTION_LENGTH) {
      setError(`Question must be under ${MAX_QUESTION_LENGTH} characters.`);
      return;
    }
    const name = studentName.trim() || "Aspirant";
    if (!studentName.trim()) persistName("Aspirant");

    setSubmitting(true);
    setError(null);
    setSubmitSuccess(false);
    try {
      await createMentorship({
        question_text: text,
        student_name: name,
        subject: subject.trim() || null,
      });
      setQuestionText("");
      setSubject("");
      setSubmitSuccess(true);
      loadQuestions();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleConversation = async (id: number) => {
    if (activeId === id) {
      setActiveId(null);
      return;
    }
    setActiveId(id);
    // Refresh just this conversation so the latest replies are shown.
    try {
      const fresh = await getMentorship(id);
      setQuestions((prev) => prev.map((q) => (q.id === id ? fresh : q)));
    } catch {
      // Keep the stale version; the list data is still readable.
    }
  };

  const activeQuestion = questions.find((q) => q.id === activeId) || null;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const pendingCount = questions.filter((q) => q.status === "pending").length;
  const answeredCount = questions.filter(
    (q) => q.status === "answered" || q.status === "resolved",
  ).length;

  return (
    <div className="mx-auto max-w-[760px] px-6 py-10">
      {/* Header */}
      <h1 className="font-display text-3xl font-extrabold leading-tight text-text-primary md:text-4xl">
        Mentorship
      </h1>
      <p className="mt-2 text-base text-text-secondary">
        Have a doubt? Ask your mentor and get a clear explanation.
      </p>

      {/* Quick stats */}
      <div className="mt-4 flex items-center gap-3 text-xs text-text-muted">
        <span>{questions.length} doubt{questions.length === 1 ? "" : "s"} asked</span>
        <span className="text-card-border">·</span>
        <span className="text-warning-amber">{pendingCount} pending</span>
        <span className="text-card-border">·</span>
        <span className="text-success-green">{answeredCount} answered</span>
      </div>

      <div className="my-8 h-px w-full bg-card-border" />

      {/* Student identity — soft scoping, not auth */}
      <div className="rounded-xl border border-card-border bg-white p-5">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
            Your name
          </span>
          <input
            value={studentName}
            onChange={(e) => persistName(e.target.value)}
            placeholder="Aspirant"
            maxLength={80}
            className="w-full rounded-lg border border-card-border px-3 py-2 text-sm focus:border-primary-blue focus:outline-none"
          />
        </label>
        <p className="mt-2 text-xs text-text-muted">
          This name is shown to your mentor. It stays on this device.
        </p>
      </div>

      {/* A. Ask a Doubt */}
      <section className="mt-8">
        <h2 className="flex items-center gap-2 text-lg font-bold text-text-primary">
          <MessageSquare className="h-5 w-5 text-primary-blue" />
          Ask a Doubt
        </h2>
        <div className="mt-3 rounded-xl border border-card-border bg-white p-5">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
              Subject / topic (optional)
            </span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Modern History, Polity, Geography…"
              maxLength={100}
              className="w-full rounded-lg border border-card-border px-3 py-2 text-sm focus:border-primary-blue focus:outline-none"
            />
          </label>
          <label className="mt-4 block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
              Your doubt
            </span>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              rows={5}
              maxLength={MAX_QUESTION_LENGTH}
              placeholder="Describe your doubt or question…"
              className="w-full resize-y rounded-lg border border-card-border px-3 py-2 text-sm focus:border-primary-blue focus:outline-none"
            />
            <div className="mt-1 flex items-center justify-between">
              <span
                className={`text-xs ${
                  questionText.length > MAX_QUESTION_LENGTH * 0.9
                    ? "text-danger-red"
                    : "text-text-muted"
                }`}
              >
                {questionText.length}/{MAX_QUESTION_LENGTH}
              </span>
            </div>
          </label>

          {error && (
            <div className="mt-4 rounded-xl border border-danger-red/30 bg-danger-bg p-3 text-sm text-danger-red">
              {error}
            </div>
          )}
          {submitSuccess && !error && (
            <div className="mt-4 rounded-xl border border-success-green/30 bg-success-bg p-3 text-sm text-success-green">
              Doubt submitted successfully. Your mentor will reply soon.
            </div>
          )}

          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              onClick={() => {
                setQuestionText("");
                setSubject("");
                setSubmitSuccess(false);
                setError(null);
              }}
              className="rounded-lg border border-card-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-gray-50"
            >
              Clear
            </button>
            <button
              disabled={submitting || !questionText.trim()}
              onClick={handleSubmit}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary-blue px-4 py-2 text-sm font-medium text-white hover:bg-primary-blue-dark disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {submitting ? "Submitting…" : "Submit Doubt"}
            </button>
          </div>
        </div>
      </section>

      {/* B. My Doubts */}
      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-lg font-bold text-text-primary">
          <MessageSquarePlus className="h-5 w-5 text-primary-blue" />
          My Doubts
        </h2>

        <div className="mt-3 space-y-3">
          {loading ? (
            <div className="rounded-xl border border-card-border bg-white p-8 text-center text-sm text-text-muted">
              Loading…
            </div>
          ) : questions.length === 0 ? (
            <div className="rounded-xl border border-card-border bg-white p-8 text-center text-sm text-text-muted">
              <MessageSquarePlus className="mx-auto h-8 w-8 text-text-muted" />
              <p className="mt-2 font-medium">You haven&apos;t asked any doubts yet.</p>
              <p className="mt-1">
                Use the form above — your mentor is ready to help.
              </p>
            </div>
          ) : (
            questions.map((q) => {
              const meta = STATUS_META[q.status as MentorshipStatus];
              const isActive = activeId === q.id;
              return (
                <div
                  key={q.id}
                  className={`overflow-hidden rounded-xl border transition-colors ${
                    isActive
                      ? "border-primary-blue bg-white"
                      : "border-card-border bg-white hover:border-gray-300"
                  }`}
                >
                  <button
                    onClick={() => toggleConversation(q.id)}
                    className="flex w-full items-start gap-3 px-5 py-4 text-left"
                  >
                    <Badge variant={meta.variant} className="shrink-0">
                      {meta.icon}
                      {meta.label}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm text-text-primary">
                        {q.question_text}
                      </p>
                      <p className="mt-1 text-xs text-text-muted">
                        {q.subject && <span>{q.subject} · </span>}
                        {formatDate(q.created_at)} · {q.replies.length}{" "}
                        {q.replies.length === 1 ? "reply" : "replies"}
                      </p>
                    </div>
                  </button>

                  {/* C. Conversation view */}
                  {isActive && activeQuestion && (
                    <div className="border-t border-card-border bg-gray-50 px-5 py-4">
                      {/* Full question */}
                      <div className="rounded-xl border border-card-border bg-white p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-text-primary">
                            {activeQuestion.student_name}
                          </span>
                          <span className="text-xs text-text-muted">
                            {formatDate(activeQuestion.created_at)}
                          </span>
                        </div>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-primary">
                          {activeQuestion.question_text}
                        </p>
                      </div>

                      {/* Replies */}
                      <div className="mt-4 space-y-3">
                        {activeQuestion.replies.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-card-border p-4 text-center text-sm text-text-muted">
                            Your mentor hasn&apos;t replied yet. We&apos;ll
                            notify you when they do.
                          </div>
                        ) : (
                          activeQuestion.replies.map((r: MentorshipQuestion["replies"][number]) => (
                            <div
                              key={r.id}
                              className="rounded-xl border border-primary-blue/20 bg-danger-bg p-4"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-primary-blue">
                                  {r.responder_id || "Mentor"}
                                </span>
                                <span className="text-xs text-text-muted">
                                  {formatDate(r.created_at)}
                                </span>
                              </div>
                              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-primary">
                                {r.reply_text}
                              </p>
                            </div>
                          ))
                        )}
                      </div>

                      <p className="mt-4 text-xs text-text-muted">
                        Status: <span className="font-semibold">{meta.label}</span>
                        {activeQuestion.status === "pending" &&
                          " — your mentor will review this soon."}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Footer hint */}
      <p className="mt-10 text-center text-xs text-text-muted">
        Your doubts are private — only you and your mentor can see them.
      </p>
    </div>
  );
}
