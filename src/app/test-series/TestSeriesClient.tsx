"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import type {
  CategoriesResponse,
  CategoryOut,
  SubcategoryOut,
  TopicOut,
  TestOut,
  TestSeriesSummary,
} from "@/lib/types";
import {
  BookOpen,
  CheckCircle2,
  Target,
  Clock,
  FileText,
  Star,
  Lock,
} from "lucide-react";
import Link from "next/link";

type StatusFilter = "all" | "open" | "coming_soon";

function TestCard({ test }: { test: TestOut }) {
  const isOpen = test.status === "open";
  const freeOrPro = test.tier === "pro" ? "Pro" : "Free";

  return (
    <div className="rounded-xl border border-card-border bg-white p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {isOpen ? (
          <span className="rounded-full bg-success-bg px-2.5 py-0.5 text-[10px] font-bold text-success-green">
            ⇢ OPEN
          </span>
        ) : (
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-bold text-text-muted">
            <span className="mr-1">🔒</span>COMING SOON
          </span>
        )}
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
            freeOrPro === "Free"
              ? "bg-success-bg text-success-green"
              : "bg-blue-50 text-primary-blue"
          }`}
        >
          {freeOrPro}
        </span>
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-medium text-text-secondary">
          {test.code}
        </span>
        <span className="text-xs text-text-muted">{test.year}</span>
        <span className="text-xs text-text-muted">📄 UPSC</span>
        <span className="text-xs text-text-muted flex items-center gap-0.5">
          <Clock className="h-3 w-3" /> {test.duration_minutes} mins
        </span>
        <span className="text-xs text-text-muted flex items-center gap-0.5">
          <FileText className="h-3 w-3" /> {test.question_count} Qs
        </span>
        <span className="text-xs text-text-muted flex items-center gap-0.5">
          <Star className="h-3 w-3" /> {test.marks.toFixed(2)} marks
        </span>
      </div>
      <h4 className="text-sm font-bold text-text-primary">{test.title}</h4>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-text-muted">
          {test.exam_name} • {test.year}
        </span>
        {isOpen ? (
          <Link
            href={`/test-series/${test.id}/take`}
            className="rounded-lg bg-primary-blue px-5 py-1.5 text-xs font-semibold text-white hover:bg-primary-blue-dark"
          >
            ▶ Start Test
          </Link>
        ) : (
          <button
            disabled
            className="flex cursor-not-allowed items-center gap-1 rounded-lg border border-card-border px-4 py-1.5 text-xs font-medium text-text-muted"
          >
            <Lock className="h-3 w-3" /> Unlocks soon
          </button>
        )}
      </div>
    </div>
  );
}

function TopicSection({
  topic,
  statusFilter,
}: {
  topic: TopicOut;
  statusFilter: StatusFilter;
}) {
  const visibleTests = topic.tests.filter((t) =>
    statusFilter === "all" ? true : t.status === statusFilter,
  );
  if (visibleTests.length === 0) return null;
  return (
    <div>
      <h4 className="text-sm font-medium text-text-secondary">{topic.name}</h4>
      <div className="mt-3 space-y-3">
        {visibleTests.map((t) => (
          <TestCard key={t.id} test={t} />
        ))}
      </div>
    </div>
  );
}

function SubcategorySection({
  sub,
  statusFilter,
}: {
  sub: SubcategoryOut;
  statusFilter: StatusFilter;
}) {
  const hasVisible = sub.topics.some((topic) =>
    topic.tests.some((t) =>
      statusFilter === "all" ? true : t.status === statusFilter,
    ),
  );
  if (!hasVisible) return null;
  return (
    <div className="ml-4 border-l-2 border-card-border pl-6">
      <h3 className="text-base font-semibold text-text-primary">{sub.name}</h3>
      <div className="ml-4 mt-3 space-y-6 border-l-2 border-card-border pl-6">
        {sub.topics.map((topic) => (
          <TopicSection
            key={topic.id}
            topic={topic}
            statusFilter={statusFilter}
          />
        ))}
      </div>
    </div>
  );
}

function CategorySection({
  cat,
  index,
  statusFilter,
}: {
  cat: CategoryOut;
  index: number;
  statusFilter: StatusFilter;
}) {
  const hasVisible = cat.subcategories.some((sub) =>
    sub.topics.some((topic) =>
      topic.tests.some((t) =>
        statusFilter === "all" ? true : t.status === statusFilter,
      ),
    ),
  );
  if (!hasVisible) return null;
  return (
    <div>
      <h2 className="text-lg font-bold text-text-primary">
        {index}. {cat.name}
      </h2>
      <div className="ml-4 mt-4 space-y-6">
        {cat.subcategories.map((sub) => (
          <SubcategorySection
            key={sub.id}
            sub={sub}
            statusFilter={statusFilter}
          />
        ))}
      </div>
    </div>
  );
}

export default function TestSeriesClient({
  summary,
  categories,
}: {
  summary: TestSeriesSummary;
  categories: CategoriesResponse;
}) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const completion = summary.total_tests
    ? Math.round((summary.active_tests / summary.total_tests) * 100)
    : 0;

  const catCount = categories.categories.length;
  const visibleCatCount = categories.categories.filter((cat) =>
    cat.subcategories.some((sub) =>
      sub.topics.some((topic) =>
        topic.tests.some((t) =>
          statusFilter === "all" ? true : t.status === statusFilter,
        ),
      ),
    ),
  ).length;

  return (
    <main className="min-h-screen bg-page-bg">
      <Navbar authState="logged-in" username="Aspirant" variant="app" />

      {/* Dark header banner */}
      <div className="bg-navbar-bg px-6 py-10">
        <div className="mx-auto max-w-[1300px]">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {summary.title}
              </h1>
              <p className="mt-1 text-sm text-gray-400">
                All available tests across subjects, with instant analysis and
                detailed feedback after submission.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="rounded-lg bg-white/10 px-4 py-2 text-center">
                <p className="text-xl font-bold text-white">
                  {summary.total_tests}
                </p>
                <p className="text-[10px] text-gray-400">TOTAL TESTS</p>
              </div>
              <div className="rounded-lg bg-white/10 px-4 py-2 text-center">
                <p className="text-xl font-bold text-white">
                  {summary.total_questions}
                </p>
                <p className="text-[10px] text-gray-400">TOTAL QUESTIONS</p>
              </div>
              <div className="rounded-lg bg-white/10 px-4 py-2 text-center">
                <p className="text-xl font-bold text-white">
                  {summary.active_tests}
                </p>
                <p className="text-[10px] text-gray-400">OPEN NOW</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1300px] px-6 py-8">
        {/* Stat cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            icon={<BookOpen className="h-5 w-5 text-primary-blue" />}
            value={String(summary.active_tests)}
            label="Active Tests"
            sublabel={`${summary.total_tests} total in series`}
            progress={completion}
            progressColor="bg-primary-blue"
          />
          <StatCard
            icon={<CheckCircle2 className="h-5 w-5 text-success-green" />}
            value={String(summary.total_questions)}
            label="Questions Available"
            sublabel="Across all open tests"
            progress={100}
            progressColor="bg-success-green"
          />
          <StatCard
            icon={<Target className="h-5 w-5 text-success-green" />}
            value={String(catCount)}
            label="Subjects Covered"
            sublabel="Mapped to your syllabus"
            progress={100}
            progressColor="bg-success-green"
          />
        </div>

        {/* Filter row */}
        <div className="mt-8 flex items-center justify-between">
          <span className="text-sm text-text-secondary">
            Showing {visibleCatCount} of {catCount} categories
          </span>
          <div className="flex gap-2">
            {(["all", "open", "coming_soon"] as StatusFilter[]).map((f) => {
              const active = statusFilter === f;
              const label =
                f === "all"
                  ? "All"
                  : f === "open"
                    ? "Open"
                    : "Coming Soon";
              return (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                    active
                      ? "border-primary-blue bg-primary-blue text-white"
                      : "border-card-border bg-white text-text-secondary hover:bg-gray-50"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category outline */}
        <div className="mt-6 space-y-8">
          {categories.categories.map((cat, i) => (
            <CategorySection
              key={cat.id}
              cat={cat}
              index={i + 1}
              statusFilter={statusFilter}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
