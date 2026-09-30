"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/Badge";
import {
  AdminExam,
  AdminPaper,
  createExam,
  createPaper,
  deleteQuestion,
  getAdminExams,
  getAdminPapers,
} from "@/lib/api";

export default function ExamsSection() {
  const [exams, setExams] = useState<AdminExam[]>([]);
  const [papers, setPapers] = useState<AdminPaper[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [examName, setExamName] = useState("");
  const [paperExamId, setPaperExamId] = useState<number | undefined>(undefined);
  const [paperYear, setPaperYear] = useState<number>(new Date().getFullYear());
  const [busy, setBusy] = useState(false);

  const load = () => {
    setError(null);
    Promise.all([getAdminExams(), getAdminPapers()])
      .then(([e, p]) => {
        setExams(e);
        setPapers(p);
      })
      .catch((e) => setError(e.message));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreateExam = async () => {
    if (!examName.trim()) return;
    setBusy(true);
    try {
      await createExam(examName.trim());
      setExamName("");
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleCreatePaper = async () => {
    if (paperExamId === undefined) return;
    setBusy(true);
    try {
      await createPaper(paperExamId, paperYear);
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary">Exams &amp; Papers</h1>
      <p className="mt-1 text-sm text-text-muted">
        Exams are the containers; papers are the exam+year pairs that questions attach to.
      </p>

      {error && (
        <div className="mt-4 rounded-xl border border-danger-red/30 bg-danger-bg p-3 text-sm text-danger-red">
          {error}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Create exam */}
        <div className="rounded-xl border border-card-border bg-white p-5">
          <h3 className="text-sm font-bold text-text-primary">Add Exam</h3>
          <div className="mt-3 flex items-center gap-2">
            <input
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              placeholder="e.g. UPSC Prelims"
              className="flex-1 rounded-lg border border-card-border px-3 py-2 text-sm focus:border-primary-blue focus:outline-none"
            />
            <button
              disabled={busy || !examName.trim()}
              onClick={handleCreateExam}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary-blue px-3 py-2 text-sm font-medium text-white hover:bg-primary-blue-dark disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        </div>

        {/* Create paper */}
        <div className="rounded-xl border border-card-border bg-white p-5">
          <h3 className="text-sm font-bold text-text-primary">Add Paper</h3>
          <div className="mt-3 flex items-end gap-2">
            <div className="flex-1">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                Exam
              </span>
              <div className="relative">
                <select
                  value={paperExamId ?? ""}
                  onChange={(e) => setPaperExamId(Number(e.target.value))}
                  className="w-full appearance-none rounded-lg border border-card-border px-3 py-2 pr-8 text-sm focus:border-primary-blue focus:outline-none"
                >
                  <option value="">Select exam…</option>
                  {exams.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              </div>
            </div>
            <div className="w-28">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                Year
              </span>
              <input
                type="number"
                value={paperYear}
                onChange={(e) => setPaperYear(Number(e.target.value))}
                className="w-full rounded-lg border border-card-border px-3 py-2 text-sm focus:border-primary-blue focus:outline-none"
              />
            </div>
            <button
              disabled={busy || paperExamId === undefined}
              onClick={handleCreatePaper}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary-blue px-3 py-2 text-sm font-medium text-white hover:bg-primary-blue-dark disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Exams list */}
      <div className="mt-6 space-y-3">
        {exams.map((exam) => (
          <div key={exam.id} className="rounded-xl border border-card-border bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-text-primary">{exam.name}</h3>
                <p className="text-xs text-text-muted">
                  {exam.paper_count} papers · {exam.question_count} questions
                </p>
              </div>
            </div>
            {exam.papers.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {exam.papers.map((p) => (
                  <Badge key={p.id} variant="neutral">
                    {p.year} · {p.question_count} Q
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
