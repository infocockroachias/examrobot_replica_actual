"use client";

import { useEffect, useState } from "react";
import { Edit3, Link2, Plus, Trash2, X } from "lucide-react";
import { Badge, Pill } from "@/components/Badge";
import SlideOverDrawer from "@/components/SlideOverDrawer";
import {
  AdminPaper,
  AdminPattern,
  AdminPatternCategory,
  createPattern,
  createPatternCategory,
  deletePattern,
  deletePatternCategory,
  getAdminPapers,
  getAdminPatterns,
  getAdminPatternCategories,
  getAdminQuestions,
  getPatternQuestions,
  linkPatternQuestion,
  PatternQuestionLink,
  unlinkPatternQuestion,
  updatePattern,
} from "@/lib/api";

const CLASSIFICATIONS = ["hot", "rising", "evergreen", "sporadic", "fading"] as const;

export default function PatternXraySection() {
  const [categories, setCategories] = useState<AdminPatternCategory[]>([]);
  const [patterns, setPatterns] = useState<AdminPattern[]>([]);
  const [catFilter, setCatFilter] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  // Category drawer
  const [catDrawer, setCatDrawer] = useState(false);
  const [catName, setCatName] = useState("");

  // Pattern drawer
  const [patDrawer, setPatDrawer] = useState(false);
  const [editingPat, setEditingPat] = useState<AdminPattern | null>(null);
  const [patForm, setPatForm] = useState({
    category_id: 0,
    title: "",
    classification: "sporadic",
    tested_score: 0,
    year_min: 0,
    year_max: 0,
    exams_covered: "",
  });

  // Link drawer
  const [linkingPattern, setLinkingPattern] = useState<AdminPattern | null>(null);
  const [links, setLinks] = useState<PatternQuestionLink[]>([]);
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: number; question_text: string; subject: string; topic: string }[]>([]);

  const load = () => {
    setError(null);
    Promise.all([getAdminPatternCategories(), getAdminPatterns(catFilter)])
      .then(([c, p]) => {
        setCategories(c);
        setPatterns(p);
      })
      .catch((e) => setError(e.message));
  };

  useEffect(() => {
    load();
  }, [catFilter]);

  const handleCreateCategory = async () => {
    if (!catName.trim()) return;
    try {
      await createPatternCategory({ name: catName.trim() });
      setCatDrawer(false);
      setCatName("");
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm("Delete this pattern category and all its patterns?")) return;
    try {
      await deletePatternCategory(id);
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const openCreatePattern = () => {
    setEditingPat(null);
    setPatForm({
      category_id: categories[0]?.id ?? 0,
      title: "",
      classification: "sporadic",
      tested_score: 0,
      year_min: 0,
      year_max: 0,
      exams_covered: "",
    });
    setPatDrawer(true);
  };

  const openEditPattern = (p: AdminPattern) => {
    setEditingPat(p);
    setPatForm({
      category_id: p.category_id,
      title: p.title,
      classification: p.classification,
      tested_score: p.tested_score,
      year_min: p.year_min,
      year_max: p.year_max,
      exams_covered: p.exams_covered.join(", "),
    });
    setPatDrawer(true);
  };

  const handleSavePattern = async () => {
    const payload = {
      ...patForm,
      exams_covered: patForm.exams_covered
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    try {
      if (editingPat) {
        await updatePattern(editingPat.id, payload);
      } else {
        await createPattern(payload);
      }
      setPatDrawer(false);
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleDeletePattern = async (id: number) => {
    if (!window.confirm("Delete this pattern and its question links?")) return;
    try {
      await deletePattern(id);
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const openLink = async (p: AdminPattern) => {
    setLinkingPattern(p);
    try {
      setLinks(await getPatternQuestions(p.id));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleSearch = async () => {
    if (!searchQ.trim()) return;
    try {
      const res = await getAdminQuestions({ search: searchQ, page_size: 10 });
      setSearchResults(
        res.questions.map((q) => ({
          id: q.id,
          question_text: q.question_text,
          subject: q.subject,
          topic: q.topic,
        })),
      );
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleLink = async (questionId: number) => {
    if (!linkingPattern) return;
    try {
      await linkPatternQuestion(linkingPattern.id, questionId);
      setLinks(await getPatternQuestions(linkingPattern.id));
      setSearchQ("");
      setSearchResults([]);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleUnlink = async (questionId: number) => {
    if (!linkingPattern) return;
    try {
      await unlinkPatternQuestion(linkingPattern.id, questionId);
      setLinks(await getPatternQuestions(linkingPattern.id));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const clsVariant = (c: string) =>
    c === "hot" ? "red" : c === "rising" ? "amber" : c === "evergreen" ? "green" : c === "sporadic" ? "gray" : "purple";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Pattern X-Ray</h1>
          <p className="mt-1 text-sm text-text-muted">
            Pattern categories → patterns → linked questions (easy → hard).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCatDrawer(true);
              setCatName("");
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-card-border bg-white px-3 py-2 text-sm font-medium text-text-secondary hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </button>
          <button
            onClick={openCreatePattern}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-blue px-3 py-2 text-sm font-medium text-white hover:bg-primary-blue-dark"
          >
            <Plus className="h-4 w-4" />
            Add Pattern
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-danger-red/30 bg-danger-bg p-3 text-sm text-danger-red">
          {error}
        </div>
      )}

      {/* Category filter chips */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setCatFilter(undefined)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            catFilter === undefined ? "bg-navbar-bg text-white" : "bg-white text-text-secondary hover:bg-gray-100"
          }`}
        >
          All Categories
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCatFilter(c.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              catFilter === c.id ? "bg-navbar-bg text-white" : "bg-white text-text-secondary hover:bg-gray-100"
            }`}
          >
            {c.name} ({c.pattern_count})
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Categories */}
        <div className="rounded-xl border border-card-border bg-white p-5">
          <h3 className="text-sm font-bold text-text-primary">Categories</h3>
          <div className="mt-3 space-y-1">
            {categories.length === 0 ? (
              <p className="text-sm text-text-muted">No categories yet.</p>
            ) : (
              categories.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-gray-50"
                >
                  <span className="text-sm text-text-primary">
                    {c.name}{" "}
                    <span className="text-xs text-text-muted">{c.pattern_count} patterns</span>
                  </span>
                  <button
                    onClick={() => handleDeleteCategory(c.id)}
                    className="rounded p-1 text-text-muted hover:bg-danger-bg hover:text-danger-red"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Patterns */}
        <div className="space-y-3">
          {patterns.length === 0 ? (
            <div className="rounded-xl border border-card-border bg-white p-8 text-center text-sm text-text-muted">
              No patterns in this category.
            </div>
          ) : (
            patterns.map((p) => (
              <div key={p.id} className="rounded-xl border border-card-border bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Pill variant={clsVariant(p.classification)}>{p.title}</Pill>
                      <Badge variant={clsVariant(p.classification)}>{p.classification}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-text-muted">
                      Score {p.tested_score} · {p.year_min}–{p.year_max} · {p.exams_covered.join(", ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {p.has_brief ? (
                      <Badge variant="green">brief ✓</Badge>
                    ) : (
                      <Badge variant="amber">no brief</Badge>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => openLink(p)}
                    className="inline-flex items-center gap-1 rounded-lg border border-card-border px-2 py-1 text-xs font-medium text-text-secondary hover:bg-gray-50"
                  >
                    <Link2 className="h-3.5 w-3.5" />
                    Questions ({p.question_count})
                  </button>
                  <button
                    onClick={() => openEditPattern(p)}
                    className="rounded-lg p-1.5 text-text-muted hover:bg-gray-100 hover:text-primary-blue"
                    title="Edit"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePattern(p.id)}
                    className="rounded-lg p-1.5 text-text-muted hover:bg-danger-bg hover:text-danger-red"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Category drawer */}
      <SlideOverDrawer
        open={catDrawer}
        onClose={() => setCatDrawer(false)}
        title="Add Pattern Category"
        icon={<Plus className="h-5 w-5" />}
        width="w-[400px]"
      >
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
              Name
            </span>
            <input
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="e.g. Governance"
              className="w-full rounded-lg border border-card-border px-3 py-2 text-sm focus:border-primary-blue focus:outline-none"
            />
          </label>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setCatDrawer(false)}
              className="rounded-lg border border-card-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              disabled={!catName.trim()}
              onClick={handleCreateCategory}
              className="rounded-lg bg-primary-blue px-4 py-2 text-sm font-medium text-white hover:bg-primary-blue-dark disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </div>
      </SlideOverDrawer>

      {/* Pattern drawer */}
      <SlideOverDrawer
        open={patDrawer}
        onClose={() => setPatDrawer(false)}
        title={editingPat ? "Edit Pattern" : "Add Pattern"}
        icon={editingPat ? <Edit3 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        width="w-[480px]"
      >
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
              Category
            </span>
            <select
              value={patForm.category_id}
              onChange={(e) => setPatForm({ ...patForm, category_id: Number(e.target.value) })}
              className="w-full rounded-lg border border-card-border px-3 py-2 text-sm focus:border-primary-blue focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
              Title
            </span>
            <input
              value={patForm.title}
              onChange={(e) => setPatForm({ ...patForm, title: e.target.value })}
              className="w-full rounded-lg border border-card-border px-3 py-2 text-sm focus:border-primary-blue focus:outline-none"
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                Classification
              </span>
              <select
                value={patForm.classification}
                onChange={(e) => setPatForm({ ...patForm, classification: e.target.value })}
                className="w-full rounded-lg border border-card-border px-3 py-2 text-sm focus:border-primary-blue focus:outline-none"
              >
                {CLASSIFICATIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                Tested score
              </span>
              <input
                type="number"
                step="0.1"
                value={patForm.tested_score}
                onChange={(e) => setPatForm({ ...patForm, tested_score: Number(e.target.value) })}
                className="w-full rounded-lg border border-card-border px-3 py-2 text-sm focus:border-primary-blue focus:outline-none"
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                Year min
              </span>
              <input
                type="number"
                value={patForm.year_min}
                onChange={(e) => setPatForm({ ...patForm, year_min: Number(e.target.value) })}
                className="w-full rounded-lg border border-card-border px-3 py-2 text-sm focus:border-primary-blue focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                Year max
              </span>
              <input
                type="number"
                value={patForm.year_max}
                onChange={(e) => setPatForm({ ...patForm, year_max: Number(e.target.value) })}
                className="w-full rounded-lg border border-card-border px-3 py-2 text-sm focus:border-primary-blue focus:outline-none"
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
              Exams covered (comma-separated)
            </span>
            <input
              value={patForm.exams_covered}
              onChange={(e) => setPatForm({ ...patForm, exams_covered: e.target.value })}
              placeholder="UPSC Prelims, State PSC"
              className="w-full rounded-lg border border-card-border px-3 py-2 text-sm focus:border-primary-blue focus:outline-none"
            />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setPatDrawer(false)}
              className="rounded-lg border border-card-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              disabled={!patForm.title || !patForm.category_id}
              onClick={handleSavePattern}
              className="rounded-lg bg-primary-blue px-4 py-2 text-sm font-medium text-white hover:bg-primary-blue-dark disabled:opacity-50"
            >
              {editingPat ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </SlideOverDrawer>

      {/* Link drawer */}
      <SlideOverDrawer
        open={!!linkingPattern}
        onClose={() => {
          setLinkingPattern(null);
          setSearchQ("");
          setSearchResults([]);
        }}
        title={linkingPattern ? `Link: ${linkingPattern.title}` : ""}
        subtitle={`${links.length} questions linked`}
        icon={<Link2 className="h-5 w-5" />}
        width="w-[520px]"
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search questions to link…"
              className="flex-1 rounded-lg border border-card-border px-3 py-2 text-sm focus:border-primary-blue focus:outline-none"
            />
            <button
              onClick={handleSearch}
              className="rounded-lg border border-card-border px-3 py-2 text-sm font-medium text-text-secondary hover:bg-gray-50"
            >
              Search
            </button>
          </div>
          {searchResults.length > 0 && (
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-card-border">
              {searchResults.map((q) => (
                <div
                  key={q.id}
                  className="flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50"
                >
                  <span className="mr-2 truncate text-text-secondary">
                    #{q.id} {q.subject} &rsaquo; {q.topic}
                  </span>
                  <button
                    onClick={() => handleLink(q.id)}
                    className="shrink-0 rounded bg-primary-blue px-2 py-1 text-xs font-medium text-white hover:bg-primary-blue-dark"
                  >
                    Link
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Linked (easy → hard)
          </p>
          {links.length === 0 ? (
            <p className="text-sm text-text-muted">No questions linked yet.</p>
          ) : (
            <div className="space-y-1">
              {links.map((l) => (
                <div
                  key={l.question_id}
                  className="flex items-center justify-between rounded-lg border border-card-border px-3 py-2 text-sm"
                >
                  <span className="truncate text-text-secondary">
                    <span className="font-medium text-text-primary">#{l.difficulty_order}</span> ·{" "}
                    {l.question_text}
                  </span>
                  <button
                    onClick={() => handleUnlink(l.question_id)}
                    className="ml-2 shrink-0 rounded p-1 text-text-muted hover:bg-danger-bg hover:text-danger-red"
                    title="Unlink"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </SlideOverDrawer>
    </div>
  );
}
