"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Badge } from "@/components/Badge";
import SlideOverDrawer from "@/components/SlideOverDrawer";
import {
  AdminPaper,
  AdminQuestion,
  AdminQuestionInput,
  bulkCreateQuestions,
  createQuestion,
  deleteQuestion,
  getAdminPapers,
  getAdminQuestions,
  updateQuestion,
} from "@/lib/api";

const emptyForm = (): FormState => ({
  paper_id: 0,
  question_number: 1,
  question_text: "",
  subject: "General",
  topic: "General",
  subtopic: "",
  options: [
    { label: "A", text: "", is_correct: false },
    { label: "B", text: "", is_correct: false },
    { label: "C", text: "", is_correct: false },
    { label: "D", text: "", is_correct: false },
  ],
});

type FormState = AdminQuestionInput & { subtopic: string };

export default function QuestionsSection() {
  const [papers, setPapers] = useState<AdminPaper[]>([]);
  const [rows, setRows] = useState<AdminQuestion[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [examFilter, setExamFilter] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [drawerError, setDrawerError] = useState<string | null>(null);

  // Bulk upload state
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkMsg, setBulkMsg] = useState<string | null>(null);

  const pageSize = 25;

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      getAdminPapers(),
      getAdminQuestions({ search, exam_id: examFilter, page, page_size: pageSize }),
    ])
      .then(([p, r]) => {
        setPapers(p);
        setRows(r.questions);
        setTotal(r.total);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, examFilter]);

  // Reset to page 1 when search/exam filter changes.
  useEffect(() => {
    setPage(1);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, examFilter]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setDrawerError(null);
    setDrawerOpen(true);
  };

  const openEdit = async (q: AdminQuestion) => {
    setEditingId(q.id);
    setDrawerError(null);
    setForm({
      paper_id: q.paper_id,
      question_number: q.question_number,
      question_text: q.question_text,
      subject: q.subject,
      topic: q.topic,
      subtopic: q.subtopic ?? "",
      options: q.options.map((o) => ({
        label: o.label,
        text: o.option_text,
        is_correct: o.is_correct,
      })),
    });
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setDrawerError(null);
    const payload = {
      ...form,
      subtopic: form.subtopic || null,
    };
    try {
      if (editingId !== null) {
        await updateQuestion(editingId, payload);
      } else {
        await createQuestion(payload);
      }
      setDrawerOpen(false);
      load();
    } catch (e) {
      setDrawerError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (q: AdminQuestion) => {
    if (!window.confirm(`Delete question #${q.question_number} (ID ${q.id})? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteQuestion(q.id);
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleBulkUpload = async () => {
    setBulkBusy(true);
    setBulkMsg(null);
    let parsed: AdminQuestionInput[];
    try {
      parsed = JSON.parse(bulkText);
      if (!Array.isArray(parsed)) {
        throw new Error("JSON must be an array of questions");
      }
    } catch (e) {
      setBulkMsg(`Invalid JSON: ${(e as Error).message}`);
      setBulkBusy(false);
      return;
    }
    try {
      const res = await bulkCreateQuestions(parsed);
      setBulkMsg(`Created ${res.created} questions.`);
      setBulkText("");
      load();
    } catch (e) {
      setBulkMsg(`Upload failed: ${(e as Error).message}`);
    } finally {
      setBulkBusy(false);
    }
  };

  const examNames = useMemo(() => {
    const map = new Map<number, string>();
    papers.forEach((p) => map.set(p.exam_id, p.exam_name));
    return map;
  }, [papers]);

  const distinctExamIds = useMemo(() => {
    const ids = new Set<number>();
    papers.forEach((p) => ids.add(p.exam_id));
    return Array.from(ids).sort((a, b) => (examNames.get(a) ?? "").localeCompare(examNames.get(b) ?? ""));
  }, [papers, examNames]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Questions</h1>
          <p className="mt-1 text-sm text-text-muted">
            The shared spine for Topic Intelligence &amp; PYQ Deep Decode. {total} questions total.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setBulkOpen(true);
              setBulkMsg(null);
              setBulkText("");
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-card-border bg-white px-3 py-2 text-sm font-medium text-text-secondary hover:bg-gray-50"
          >
            <Upload className="h-4 w-4" />
            Bulk Upload
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-blue px-3 py-2 text-sm font-medium text-white hover:bg-primary-blue-dark"
          >
            <Plus className="h-4 w-4" />
            Add Question
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-danger-red/30 bg-danger-bg p-3 text-sm text-danger-red">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search question text…"
            className="rounded-lg border border-card-border bg-white py-2 pl-9 pr-3 text-sm focus:border-primary-blue focus:outline-none"
          />
        </div>
        <div className="relative">
          <select
            value={examFilter ?? ""}
            onChange={(e) => setExamFilter(e.target.value ? Number(e.target.value) : undefined)}
            className="appearance-none rounded-lg border border-card-border bg-white py-2 pl-3 pr-8 text-sm focus:border-primary-blue focus:outline-none"
          >
            <option value="">All exams</option>
            {distinctExamIds.map((id) => (
              <option key={id} value={id}>
                {examNames.get(id)}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-xl border border-card-border bg-white">
        <div className="thin-scroll overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-card-border bg-gray-50 text-xs uppercase tracking-wider text-text-muted">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Paper</th>
                <th className="px-4 py-3">Q#</th>
                <th className="px-4 py-3">Text</th>
                <th className="px-4 py-3">Subject / Topic</th>
                <th className="px-4 py-3">Options</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-text-muted">
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-text-muted">
                    No questions match this filter.
                  </td>
                </tr>
              ) : (
                rows.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-text-muted">{q.id}</td>
                    <td className="px-4 py-3">
                      <span className="text-text-secondary">
                        {q.exam_name} · {q.year}
                      </span>
                    </td>
                    <td className="px-4 py-3">{q.question_number}</td>
                    <td className="max-w-md truncate px-4 py-3 text-text-primary">
                      {q.question_text}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-text-secondary">
                        {q.subject} &rsaquo; {q.topic}
                      </span>
                      {q.subtopic && (
                        <span className="text-text-muted"> &rsaquo; {q.subtopic}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {q.options.map((o) => (
                          <span
                            key={o.label}
                            className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                              o.is_correct
                                ? "bg-success-bg text-success-green"
                                : "bg-gray-100 text-text-secondary"
                            }`}
                          >
                            {o.label}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(q)}
                          className="rounded-lg p-1.5 text-text-muted hover:bg-gray-100 hover:text-primary-blue"
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(q)}
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

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-card-border px-4 py-3 text-sm">
          <span className="text-text-muted">
            Page {page} of {totalPages} · {total} questions
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg p-1.5 text-text-muted hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg p-1.5 text-text-muted hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Create / Edit drawer */}
      <SlideOverDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingId !== null ? "Edit Question" : "Add Question"}
        subtitle={editingId !== null ? `Question ID ${editingId}` : "Create a new question with options"}
        icon={editingId !== null ? <Edit3 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        width="w-[560px]"
      >
        <div className="space-y-4">
          {drawerError && (
            <div className="rounded-lg border border-danger-red/30 bg-danger-bg p-3 text-sm text-danger-red">
              {drawerError}
            </div>
          )}

          <Field label="Paper">
            <select
              value={form.paper_id || ""}
              onChange={(e) => setForm({ ...form, paper_id: Number(e.target.value) })}
              className="w-full rounded-lg border border-card-border px-3 py-2 text-sm focus:border-primary-blue focus:outline-none"
            >
              <option value="">Select a paper…</option>
              {papers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.exam_name} · {p.year} (ID {p.id})
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Question number">
              <input
                type="number"
                min={1}
                value={form.question_number}
                onChange={(e) => setForm({ ...form, question_number: Number(e.target.value) })}
                className="w-full rounded-lg border border-card-border px-3 py-2 text-sm focus:border-primary-blue focus:outline-none"
              />
            </Field>
            <Field label="Subject">
              <input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full rounded-lg border border-card-border px-3 py-2 text-sm focus:border-primary-blue focus:outline-none"
              />
            </Field>
          </div>

          <Field label="Question text">
            <textarea
              rows={3}
              value={form.question_text}
              onChange={(e) => setForm({ ...form, question_text: e.target.value })}
              className="w-full rounded-lg border border-card-border px-3 py-2 text-sm focus:border-primary-blue focus:outline-none"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Topic">
              <input
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                className="w-full rounded-lg border border-card-border px-3 py-2 text-sm focus:border-primary-blue focus:outline-none"
              />
            </Field>
            <Field label="Subtopic (optional)">
              <input
                value={form.subtopic}
                onChange={(e) => setForm({ ...form, subtopic: e.target.value })}
                className="w-full rounded-lg border border-card-border px-3 py-2 text-sm focus:border-primary-blue focus:outline-none"
              />
            </Field>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Options (mark one correct)
            </p>
            <div className="space-y-2">
              {form.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        options: form.options.map((o, j) => ({
                          ...o,
                          is_correct: j === i,
                        })),
                      })
                    }
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-sm font-bold ${
                      opt.is_correct
                        ? "border-success-green bg-success-bg text-success-green"
                        : "border-card-border text-text-secondary hover:bg-gray-50"
                    }`}
                    title="Mark correct"
                  >
                    {opt.label}
                  </button>
                  <input
                    value={opt.text}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        options: form.options.map((o, j) =>
                          j === i ? { ...o, text: e.target.value } : o,
                        ),
                      })
                    }
                    placeholder={`Option ${opt.label} text…`}
                    className="flex-1 rounded-lg border border-card-border px-3 py-2 text-sm focus:border-primary-blue focus:outline-none"
                  />
                  {form.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          options: form.options.filter((_, j) => j !== i),
                        })
                      }
                      className="rounded-lg p-1.5 text-text-muted hover:text-danger-red"
                      title="Remove option"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              {form.options.length < 6 && (
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      options: [
                        ...form.options,
                        {
                          label: String.fromCharCode(65 + form.options.length),
                          text: "",
                          is_correct: false,
                        },
                      ],
                    })
                  }
                  className="text-xs font-medium text-primary-blue hover:underline"
                >
                  + Add option
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setDrawerOpen(false)}
              className="rounded-lg border border-card-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              disabled={saving || !form.paper_id || !form.question_text}
              onClick={handleSave}
              className="rounded-lg bg-primary-blue px-4 py-2 text-sm font-medium text-white hover:bg-primary-blue-dark disabled:opacity-50"
            >
              {saving ? "Saving…" : editingId !== null ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </SlideOverDrawer>

      {/* Bulk upload modal */}
      <BulkUploadModal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        text={bulkText}
        setText={setBulkText}
        busy={bulkBusy}
        msg={bulkMsg}
        onUpload={handleBulkUpload}
      />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

function BulkUploadModal({
  open,
  onClose,
  text,
  setText,
  busy,
  msg,
  onUpload,
}: {
  open: boolean;
  onClose: () => void;
  text: string;
  setText: (t: string) => void;
  busy: boolean;
  msg: string | null;
  onUpload: () => void;
}) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-card-border bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-text-primary">Bulk Upload Questions</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-text-muted hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-2 text-sm text-text-secondary">
          Paste a JSON array. Each question needs <code className="text-xs">paper_id</code>,{" "}
          <code className="text-xs">question_number</code>, <code className="text-xs">question_text</code>,
          and an <code className="text-xs">options</code> array with{" "}
          <code className="text-xs">label</code>, <code className="text-xs">text</code>,{" "}
          <code className="text-xs">is_correct</code> (exactly one true).
        </p>
        <textarea
          rows={12}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`[\n  {\n    "paper_id": 1,\n    "question_number": 1,\n    "question_text": "…",\n    "subject": "Polity",\n    "topic": "Fundamental Rights",\n    "options": [\n      {"label": "A", "text": "…", "is_correct": true},\n      {"label": "B", "text": "…", "is_correct": false}\n    ]\n  }\n]`}
          className="mt-3 w-full rounded-lg border border-card-border bg-gray-50 p-3 font-mono text-xs focus:border-primary-blue focus:outline-none"
        />
        {msg && (
          <p
            className={`mt-2 text-sm ${
              msg.startsWith("Created") ? "text-success-green" : "text-danger-red"
            }`}
          >
            {msg}
          </p>
        )}
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-card-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-gray-50"
          >
            Close
          </button>
          <button
            disabled={busy || !text.trim()}
            onClick={onUpload}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-blue px-4 py-2 text-sm font-medium text-white hover:bg-primary-blue-dark disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {busy ? "Uploading…" : "Upload"}
          </button>
        </div>
      </div>
    </>
  );
}
