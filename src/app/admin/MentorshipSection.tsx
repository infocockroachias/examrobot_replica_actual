"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  MessageSquare,
  MessageSquarePlus,
  Send,
} from "lucide-react";
import { Badge, Pill } from "@/components/Badge";
import SlideOverDrawer from "@/components/SlideOverDrawer";
import {
  MENTORSHIP_STATUSES,
  MentorshipQuestion,
  MentorshipStatus,
  getAdminMentorship,
  getAdminMentorshipQuestion,
  replyToMentorship,
  updateMentorshipStatus,
} from "@/lib/api";

const STATUS_META: Record<
  MentorshipStatus,
  { label: string; variant: "amber" | "blue" | "green"; icon: React.ReactNode }
> = {
  pending: {
    label: "Pending",
    variant: "amber",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  answered: {
    label: "Answered",
    variant: "blue",
    icon: <MessageSquare className="h-3.5 w-3.5" />,
  },
  resolved: {
    label: "Resolved",
    variant: "green",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
};

export default function MentorshipSection() {
  const [questions, setQuestions] = useState<MentorshipQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<MentorshipStatus | "all">("all");

  // Conversation drawer state.
  const [active, setActive] = useState<MentorshipQuestion | null>(null);
  const [replyText, setReplyText] = useState("");
  const [savingReply, setSavingReply] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);

  const load = () => {
    setError(null);
    setLoading(true);
    getAdminMentorship(activeFilter === "all" ? undefined : activeFilter)
      .then(setQuestions)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

  const openConversation = async (q: MentorshipQuestion) => {
    setError(null);
    try {
      const fresh = await getAdminMentorshipQuestion(q.id);
      setActive(fresh);
      setReplyText("");
    } catch (e) {
      setError((e as Error).message);
      // Fall back to the list data we already have.
      setActive(q);
    }
  };

  const closeConversation = () => {
    setActive(null);
    setReplyText("");
  };

  const handleReply = async () => {
    if (!active || !replyText.trim()) return;
    setSavingReply(true);
    setError(null);
    try {
      const updated = await replyToMentorship(active.id, replyText.trim(), "Admin");
      setActive(updated);
      setReplyText("");
      load(); // refresh list so status/reply counts update
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSavingReply(false);
    }
  };

  const handleStatusChange = async (status: MentorshipStatus) => {
    if (!active) return;
    setStatusSaving(true);
    setError(null);
    try {
      const updated = await updateMentorshipStatus(active.id, status);
      setActive(updated);
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setStatusSaving(false);
    }
  };

  const pendingCount = questions.filter((q) => q.status === "pending").length;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Mentorship</h1>
          <p className="mt-1 text-sm text-text-muted">
            Student doubts and guidance conversations.
            {pendingCount > 0 && (
              <span className="ml-1 font-medium text-warning-amber">
                {pendingCount} awaiting reply
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={() => setActiveFilter("all")}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
            activeFilter === "all"
              ? "bg-navbar-bg text-white"
              : "bg-gray-100 text-text-secondary hover:bg-gray-200"
          }`}
        >
          All ({questions.length})
        </button>
        {MENTORSHIP_STATUSES.map((s) => {
          const meta = STATUS_META[s];
          const count = questions.filter((q) => q.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setActiveFilter(s)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeFilter === s
                  ? "bg-navbar-bg text-white"
                  : "bg-gray-100 text-text-secondary hover:bg-gray-200"
              }`}
            >
              {meta.icon}
              {meta.label} ({count})
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-danger-red/30 bg-danger-bg p-3 text-sm text-danger-red">
          {error}
        </div>
      )}

      {/* Question list */}
      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="rounded-xl border border-card-border bg-white p-8 text-center text-sm text-text-muted">
            Loading…
          </div>
        ) : questions.length === 0 ? (
          <div className="rounded-xl border border-card-border bg-white p-8 text-center text-sm text-text-muted">
            <MessageSquarePlus className="mx-auto h-8 w-8 text-text-muted" />
            <p className="mt-2 font-medium">No doubts here yet.</p>
            <p className="mt-1">
              {activeFilter !== "all"
                ? "Try a different status filter."
                : "Submitted student doubts will appear here."}
            </p>
          </div>
        ) : (
          questions.map((q) => {
            const meta = STATUS_META[q.status as MentorshipStatus];
            return (
              <div
                key={q.id}
                className="rounded-xl border border-card-border bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-text-primary">
                        {q.student_name}
                      </span>
                      <Badge variant={meta.variant}>
                        {meta.icon}
                        {meta.label}
                      </Badge>
                      {q.subject && <Badge variant="gray">{q.subject}</Badge>}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-text-secondary">
                      {q.question_text}
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      #{q.id} · {formatDate(q.created_at)} ·{" "}
                      {q.replies.length}{" "}
                      {q.replies.length === 1 ? "reply" : "replies"}
                    </p>
                  </div>
                  <button
                    onClick={() => openConversation(q)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary-blue px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-blue-dark"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Open
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Conversation drawer */}
      <SlideOverDrawer
        open={!!active}
        onClose={closeConversation}
        title={active ? `Doubt #${active.id}` : ""}
        subtitle={active ? `${active.student_name}${active.subject ? ` · ${active.subject}` : ""}` : ""}
        icon={<MessageSquare className="h-5 w-5" />}
        width="w-[520px]"
      >
        {active && (
          <div className="space-y-5">
            {/* Status control */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Status
              </p>
              <div className="flex items-center gap-2">
                {MENTORSHIP_STATUSES.map((s) => {
                  const meta = STATUS_META[s];
                  const isActive = active.status === s;
                  return (
                    <button
                      key={s}
                      disabled={statusSaving || isActive}
                      onClick={() => handleStatusChange(s)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60 ${
                        isActive
                          ? "bg-navbar-bg text-white"
                          : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                      }`}
                    >
                      {meta.icon}
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Student's question */}
            <div className="rounded-xl border border-card-border bg-gray-50 p-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-text-primary">
                  {active.student_name}
                </span>
                <span className="text-xs text-text-muted">
                  {formatDate(active.created_at)}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-primary">
                {active.question_text}
              </p>
            </div>

            {/* Replies / conversation */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Conversation ({active.replies.length})
              </p>
              {active.replies.length === 0 ? (
                <p className="rounded-xl border border-dashed border-card-border p-4 text-center text-sm text-text-muted">
                  No reply yet. Write one below.
                </p>
              ) : (
                <div className="space-y-3">
                  {active.replies.map((r: MentorshipQuestion["replies"][number]) => (
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
                  ))}
                </div>
              )}
            </div>

            {/* Reply form */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Write a reply
              </p>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={5}
                placeholder="Explain the concept, point to references, clear the doubt…"
                className="w-full resize-y rounded-lg border border-card-border px-3 py-2 text-sm focus:border-primary-blue focus:outline-none"
              />
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-text-muted">
                  {replyText.trim().length}/5000
                </p>
                <button
                  disabled={savingReply || !replyText.trim() || replyText.trim().length > 5000}
                  onClick={handleReply}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary-blue px-4 py-2 text-sm font-medium text-white hover:bg-primary-blue-dark disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {savingReply ? "Sending…" : "Send Reply"}
                </button>
              </div>
            </div>
          </div>
        )}
      </SlideOverDrawer>
    </div>
  );
}
