"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Edit3,
  Link2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Badge } from "@/components/Badge";
import SlideOverDrawer from "@/components/SlideOverDrawer";
import {
  AdminQuestion,
  AdminTest,
  assignTestQuestion,
  createTest,
  createTestCategory,
  deleteTest,
  deleteTestCategory,
  getAdminQuestions,
  getAdminTests,
  getTestCategories,
  getTestQuestions,
  TestCategory,
  TestQuestion,
  unassignTestQuestion,
  updateTest,
} from "@/lib/api";

export default function TestSeriesSection() {
  const [categories, setCategories] = useState<TestCategory[]>([]);
  const [tests, setTests] = useState<AdminTest[]>([]);
  const [error, setError] = useState<string | null>(null);
  // Drawer for category create
  const [catDrawer, setCatDrawer] = useState(false);
  const [catName, setCatName] = useState("");
  const [catParent, setCatParent] = useState<number | undefined>(undefined);
  const [catLevel, setCatLevel] = useState(1);
  // Drawer for test create/edit
  const [testDrawer, setTestDrawer] = useState(false);
  const [editingTest, setEditingTest] = useState<AdminTest | null>(null);
  const [testForm, setTestForm] = useState({
    category_id: 0,
    code: "",
    title: "",
    exam_name: "UPSC",
    year: new Date().getFullYear(),
    duration_minutes: 120,
    question_count: 10,
    marks: 100,
    tier: "free",
    status: "coming_soon",
  });
  // Assignment panel
  const [assigningTest, setAssigningTest] = useState<AdminTest | null>(null);
  const [assigned, setAssigned] = useState<TestQuestion[]>([]);
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<AdminQuestion[]>([]);

  const level1Cats = categories;

  const load = () => {
    setError(null);
    Promise.all([getTestCategories(), getAdminTests()])
      .then(([c, t]) => {
        setCategories(c);
        setTests(t);
      })
      .catch((e) => setError(e.message));
  };

  useEffect(() => {
    load();
  }, []);

  const findCategory = (list: TestCategory[], id: number): TestCategory | undefined => {
    for (const c of list) {
      if (c.id === id) return c;
      const found = findCategory(c.children, id);
      if (found) return found;
    }
    return undefined;
  };

  const handleCreateCategory = async () => {
    if (!catName.trim()) return;
    try {
      await createTestCategory({
        name: catName.trim(),
        parent_id: catParent ?? null,
        level: catLevel,
      });
      setCatDrawer(false);
      setCatName("");
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (
      !window.confirm(
        "Delete this category and all its children? Tests under it will be orphaned.",
      )
    )
      return;
    try {
      await deleteTestCategory(id);
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const openCreateTest = () => {
    setEditingTest(null);
    setTestForm({
      category_id: level1Cats[0]?.id ?? 0,
      code: "",
      title: "",
      exam_name: "UPSC",
      year: new Date().getFullYear(),
      duration_minutes: 120,
      question_count: 10,
      marks: 100,
      tier: "free",
      status: "coming_soon",
    });
    setTestDrawer(true);
  };

  const openEditTest = (t: AdminTest) => {
    setEditingTest(t);
    setTestForm({
      category_id: t.category_id,
      code: t.code,
      title: t.title,
      exam_name: t.exam_name,
      year: t.year,
      duration_minutes: t.duration_minutes,
      question_count: t.question_count,
      marks: t.marks,
      tier: t.tier,
      status: t.status,
    });
    setTestDrawer(true);
  };

  const handleSaveTest = async () => {
    try {
      if (editingTest) {
        await updateTest(editingTest.id, testForm);
      } else {
        await createTest(testForm);
      }
      setTestDrawer(false);
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleDeleteTest = async (id: number) => {
    if (!window.confirm("Delete this test and all its question assignments?")) return;
    try {
      await deleteTest(id);
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const openAssign = async (t: AdminTest) => {
    setAssigningTest(t);
    try {
      setAssigned(await getTestQuestions(t.id));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleSearch = async () => {
    if (!searchQ.trim()) return;
    try {
      const res = await getAdminQuestions({ search: searchQ, page_size: 10 });
      setSearchResults(res.questions);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleAssign = async (questionId: number) => {
    if (!assigningTest) return;
    try {
      await assignTestQuestion(assigningTest.id, questionId);
      setAssigned(await getTestQuestions(assigningTest.id));
      setSearchQ("");
      setSearchResults([]);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleUnassign = async (questionId: number) => {
    if (!assigningTest) return;
    try {
      await unassignTestQuestion(assigningTest.id, questionId);
      setAssigned(await getTestQuestions(assigningTest.id));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const tierVariant = (t: string) => (t === "pro" ? "purple" : "blue");
  const statusVariant = (s: string) => (s === "open" ? "green" : "amber");

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Topic Mastery (Test Series)</h1>
          <p className="mt-1 text-sm text-text-muted">
            3-level category tree → tests → assigned questions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCatDrawer(true);
              setCatName("");
              setCatParent(undefined);
              setCatLevel(1);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-card-border bg-white px-3 py-2 text-sm font-medium text-text-secondary hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </button>
          <button
            onClick={openCreateTest}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-blue px-3 py-2 text-sm font-medium text-white hover:bg-primary-blue-dark"
          >
            <Plus className="h-4 w-4" />
            Add Test
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-danger-red/30 bg-danger-bg p-3 text-sm text-danger-red">
          {error}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Category tree */}
        <div className="rounded-xl border border-card-border bg-white p-5">
          <h3 className="text-sm font-bold text-text-primary">Category Tree</h3>
          <div className="mt-3 space-y-1">
            {level1Cats.length === 0 ? (
              <p className="text-sm text-text-muted">No categories yet.</p>
            ) : (
              level1Cats.map((c) => (
                <CategoryRow
                  key={c.id}
                  cat={c}
                  onDelete={handleDeleteCategory}
                />
              ))
            )}
          </div>
        </div>

        {/* Tests list */}
        <div className="space-y-3">
          {tests.length === 0 ? (
            <div className="rounded-xl border border-card-border bg-white p-8 text-center text-sm text-text-muted">
              No tests yet.
            </div>
          ) : (
            tests.map((t) => (
              <div key={t.id} className="rounded-xl border border-card-border bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-text-primary">{t.title}</span>
                      <Badge variant="gray">{t.code}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {t.category_name} · {t.exam_name} {t.year} · {t.duration_minutes}min ·{" "}
                      {t.marks} marks
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant={tierVariant(t.tier as string)}>{t.tier}</Badge>
                    <Badge variant={statusVariant(t.status)}>{t.status}</Badge>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => openAssign(t)}
                    className="inline-flex items-center gap-1 rounded-lg border border-card-border px-2 py-1 text-xs font-medium text-text-secondary hover:bg-gray-50"
                  >
                    <Link2 className="h-3.5 w-3.5" />
                    Questions ({t.assigned_questions})
                  </button>
                  <button
                    onClick={() => openEditTest(t)}
                    className="rounded-lg p-1.5 text-text-muted hover:bg-gray-100 hover:text-primary-blue"
                    title="Edit"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTest(t.id)}
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
        title="Add Category"
        icon={<Plus className="h-5 w-5" />}
        width="w-[420px]"
      >
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
              Name
            </span>
            <input
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              className="w-full rounded-lg border border-card-border px-3 py-2 text-sm focus:border-primary-blue focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
              Level
            </span>
            <select
              value={catLevel}
              onChange={(e) => setCatLevel(Number(e.target.value))}
              className="w-full rounded-lg border border-card-border px-3 py-2 text-sm focus:border-primary-blue focus:outline-none"
            >
              <option value={1}>Level 1 (top)</option>
              <option value={2}>Level 2 (subcategory)</option>
              <option value={3}>Level 3 (topic)</option>
            </select>
          </label>
          {catLevel > 1 && (
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                Parent
              </span>
              <select
                value={catParent ?? ""}
                onChange={(e) => setCatParent(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full rounded-lg border border-card-border px-3 py-2 text-sm focus:border-primary-blue focus:outline-none"
              >
                <option value="">Select parent…</option>
                {flattenCategories(categories)
                  .filter((c) => c.level === catLevel - 1)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {"· ".repeat(c.level - 1)}
                      {c.name}
                    </option>
                  ))}
              </select>
            </label>
          )}
          <div className="flex justify-end gap-2 pt-2">
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

      {/* Test drawer */}
      <SlideOverDrawer
        open={testDrawer}
        onClose={() => setTestDrawer(false)}
        title={editingTest ? "Edit Test" : "Add Test"}
        icon={editingTest ? <Edit3 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        width="w-[480px]"
      >
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
              Category
            </span>
            <select
              value={testForm.category_id}
              onChange={(e) => setTestForm({ ...testForm, category_id: Number(e.target.value) })}
              className="w-full rounded-lg border border-card-border px-3 py-2 text-sm focus:border-primary-blue focus:outline-none"
            >
              {flattenCategories(categories).map((c) => (
                <option key={c.id} value={c.id}>
                  {"· ".repeat(c.level - 1)}
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                Code
              </span>
              <input
                value={testForm.code}
                onChange={(e) => setTestForm({ ...testForm, code: e.target.value })}
                disabled={!!editingTest}
                className="w-full rounded-lg border border-card-border px-3 py-2 text-sm focus:border-primary-blue focus:outline-none disabled:bg-gray-50"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                Year
              </span>
              <input
                type="number"
                value={testForm.year}
                onChange={(e) => setTestForm({ ...testForm, year: Number(e.target.value) })}
                className="w-full rounded-lg border border-card-border px-3 py-2 text-sm focus:border-primary-blue focus:outline-none"
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
              Title
            </span>
            <input
              value={testForm.title}
              onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
              className="w-full rounded-lg border border-card-border px-3 py-2 text-sm focus:border-primary-blue focus:outline-none"
            />
          </label>
          <div className="grid grid-cols-3 gap-4">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                Duration (min)
              </span>
              <input
                type="number"
                value={testForm.duration_minutes}
                onChange={(e) => setTestForm({ ...testForm, duration_minutes: Number(e.target.value) })}
                className="w-full rounded-lg border border-card-border px-3 py-2 text-sm focus:border-primary-blue focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                Marks
              </span>
              <input
                type="number"
                value={testForm.marks}
                onChange={(e) => setTestForm({ ...testForm, marks: Number(e.target.value) })}
                className="w-full rounded-lg border border-card-border px-3 py-2 text-sm focus:border-primary-blue focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                Tier
              </span>
              <select
                value={testForm.tier}
                onChange={(e) => setTestForm({ ...testForm, tier: e.target.value })}
                className="w-full rounded-lg border border-card-border px-3 py-2 text-sm focus:border-primary-blue focus:outline-none"
              >
                <option value="free">free</option>
                <option value="pro">pro</option>
              </select>
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
              Status
            </span>
            <select
              value={testForm.status}
              onChange={(e) => setTestForm({ ...testForm, status: e.target.value })}
              className="w-full rounded-lg border border-card-border px-3 py-2 text-sm focus:border-primary-blue focus:outline-none"
            >
              <option value="coming_soon">coming_soon</option>
              <option value="open">open</option>
            </select>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setTestDrawer(false)}
              className="rounded-lg border border-card-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              disabled={!testForm.title || !testForm.code || !testForm.category_id}
              onClick={handleSaveTest}
              className="rounded-lg bg-primary-blue px-4 py-2 text-sm font-medium text-white hover:bg-primary-blue-dark disabled:opacity-50"
            >
              {editingTest ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </SlideOverDrawer>

      {/* Assignment drawer */}
      <SlideOverDrawer
        open={!!assigningTest}
        onClose={() => {
          setAssigningTest(null);
          setSearchQ("");
          setSearchResults([]);
        }}
        title={assigningTest ? `Assign: ${assigningTest.title}` : ""}
        subtitle={`${assigned.length} questions assigned`}
        icon={<Link2 className="h-5 w-5" />}
        width="w-[520px]"
      >
        <div className="space-y-4">
          {/* Search to add */}
          <div className="flex gap-2">
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search questions to add…"
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
                    onClick={() => handleAssign(q.id)}
                    className="shrink-0 rounded bg-primary-blue px-2 py-1 text-xs font-medium text-white hover:bg-primary-blue-dark"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Currently assigned */}
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Assigned (in order)
          </p>
          {assigned.length === 0 ? (
            <p className="text-sm text-text-muted">No questions assigned yet.</p>
          ) : (
            <div className="space-y-1">
              {assigned.map((q) => (
                <div
                  key={q.question_id}
                  className="flex items-center justify-between rounded-lg border border-card-border px-3 py-2 text-sm"
                >
                  <span className="truncate text-text-secondary">
                    <span className="font-medium text-text-primary">#{q.order}</span> · {q.question_text}
                  </span>
                  <button
                    onClick={() => handleUnassign(q.question_id)}
                    className="ml-2 shrink-0 rounded p-1 text-text-muted hover:bg-danger-bg hover:text-danger-red"
                    title="Remove"
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

function flattenCategories(cats: TestCategory[], depth = 0): (TestCategory & { depth: number })[] {
  const out: (TestCategory & { depth: number })[] = [];
  for (const c of cats) {
    out.push({ ...c, depth });
    out.push(...flattenCategories(c.children, depth + 1));
  }
  return out;
}

function CategoryRow({ cat, onDelete }: { cat: TestCategory; onDelete: (id: number) => void }) {
  const [open, setOpen] = useState(true);
  const hasChildren = cat.children.length > 0;
  return (
    <div>
      <div className="flex items-center gap-1 rounded-lg px-2 py-1.5 hover:bg-gray-50">
        <button
          onClick={() => setOpen((o) => !o)}
          className="p-0.5 text-text-muted disabled:opacity-0"
          disabled={!hasChildren}
        >
          {hasChildren ? (
            open ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : null}
        </button>
        <span className="flex-1 text-sm text-text-primary">
          {cat.name}{" "}
          <span className="text-xs text-text-muted">L{cat.level}</span>
        </span>
        <button
          onClick={() => onDelete(cat.id)}
          className="rounded p-1 text-text-muted hover:bg-danger-bg hover:text-danger-red"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      {open && hasChildren && (
        <div className="ml-4 border-l border-card-border pl-2">
          {cat.children.map((child) => (
            <CategoryRow key={child.id} cat={child} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
