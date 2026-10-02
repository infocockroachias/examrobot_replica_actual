"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  BookOpen,
  ClipboardList,
  Database,
  History,
  HeartPulse,
  Layers,
  LayoutDashboard,
  ListChecks,
  Layers3,
  MessageSquare,
  Search,
  Sparkles,
  Upload,
  Zap,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import { getAdminStats, AdminStats } from "@/lib/api";

import QuestionsSection from "./QuestionsSection";
import ExamsSection from "./ExamsSection";
import ImportSection from "./ImportSection";
import TopicIntelligenceSection from "./TopicIntelligenceSection";
import ProvenanceSection from "./ProvenanceSection";
import TestSeriesSection from "./TestSeriesSection";
import PatternXraySection from "./PatternXraySection";
import ImportHistorySection from "./ImportHistorySection";
import DataQualitySection from "./DataQualitySection";
import ReviewSection from "./ReviewSection";
import AnalyticsSection from "./AnalyticsSection";
import SubjectsSection from "./SubjectsSection";
import MentorshipSection from "./MentorshipSection";

type Section =
  | "dashboard"
  | "questions"
  | "exams"
  | "subjects"
  | "import"
  | "import-history"
  | "review-queue"
  | "data-quality"
  | "analytics"
  | "topic-intelligence"
  | "provenance"
  | "test-series"
  | "pattern-xray"
  | "mentorship";

const NAV: { key: Section; label: string; icon: React.ReactNode; group: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, group: "Overview" },
  { key: "questions", label: "Questions", icon: <Database className="h-4 w-4" />, group: "Content" },
  { key: "exams", label: "Exams & Papers", icon: <BookOpen className="h-4 w-4" />, group: "Content" },
  { key: "subjects", label: "Subjects & Topics", icon: <Layers3 className="h-4 w-4" />, group: "Content" },
  { key: "import", label: "Bulk Import", icon: <Upload className="h-4 w-4" />, group: "Content" },
  { key: "import-history", label: "Import History", icon: <History className="h-4 w-4" />, group: "Content" },
  { key: "review-queue", label: "Review Queue", icon: <ClipboardList className="h-4 w-4" />, group: "Operations" },
  { key: "data-quality", label: "Data Quality", icon: <Search className="h-4 w-4" />, group: "Operations" },
  { key: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" />, group: "Operations" },
  { key: "topic-intelligence", label: "Topic Intelligence", icon: <Sparkles className="h-4 w-4" />, group: "Intelligence" },
  { key: "provenance", label: "PYQ Deep Decode", icon: <Layers className="h-4 w-4" />, group: "Intelligence" },
  { key: "pattern-xray", label: "Pattern X-Ray", icon: <Zap className="h-4 w-4" />, group: "Intelligence" },
  { key: "test-series", label: "Topic Mastery", icon: <ListChecks className="h-4 w-4" />, group: "Testing" },
  { key: "mentorship", label: "Mentorship", icon: <MessageSquare className="h-4 w-4" />, group: "Testing" },
];

export default function AdminPage() {
  const [section, setSection] = useState<Section>("dashboard");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadStats = () => {
    getAdminStats()
      .then(setStats)
      .catch((e) => setError(e.message));
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Reload stats whenever the user switches sections so counts stay fresh.
  useEffect(() => {
    loadStats();
  }, [section]);

  const renderSection = () => {
    switch (section) {
      case "dashboard":
        return <DashboardView stats={stats} error={error} />;
      case "questions":
        return <QuestionsSection />;
      case "exams":
        return <ExamsSection />;
      case "subjects":
        return <SubjectsSection />;
      case "import":
        return <ImportSection />;
      case "import-history":
        return <ImportHistorySection />;
      case "review-queue":
        return <ReviewSection />;
      case "data-quality":
        return <DataQualitySection />;
      case "analytics":
        return <AnalyticsSection />;
      case "topic-intelligence":
        return <TopicIntelligenceSection />;
      case "provenance":
        return <ProvenanceSection />;
      case "test-series":
        return <TestSeriesSection />;
      case "pattern-xray":
        return <PatternXraySection />;
      case "mentorship":
        return <MentorshipSection />;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-page-bg">
      <Navbar authState="logged-in" username="Admin" variant="app" />

      <div className="mx-auto flex max-w-[1300px] gap-0">
        {/* Sidebar */}
        <aside className="w-[220px] shrink-0 border-r border-card-border bg-white py-6">
          <div className="px-5 pb-4">
            <p className="micro-label text-text-muted">ADMIN CONSOLE</p>
            <h2 className="mt-1 text-sm font-bold text-text-primary">Content Manager</h2>
          </div>
          <nav className="space-y-0.5 px-3">
            {NAV.map((item, i) => {
              const showGroupLabel = i === 0 || NAV[i - 1].group !== item.group;
              return (
                <div key={item.key}>
                  {showGroupLabel && (
                    <p className="micro-label mb-1 mt-3 px-2 text-[10px] text-text-muted first:mt-0">
                      {item.group.toUpperCase()}
                    </p>
                  )}
                  <button
                    onClick={() => setSection(item.key)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                      section === item.key
                        ? "bg-danger-bg font-semibold text-primary-blue"
                        : "text-text-secondary hover:bg-gray-50"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <div className="min-w-0 flex-1 px-8 py-6">{renderSection()}</div>
      </div>
    </main>
  );
}

function DashboardView({ stats, error }: { stats: AdminStats | null; error: string | null }) {
  if (error) {
    return (
      <div className="rounded-xl border border-danger-red/30 bg-danger-bg p-5 text-sm text-danger-red">
        Failed to load stats: {error}
      </div>
    );
  }
  if (!stats) {
    return <div className="text-sm text-text-muted">Loading dashboard…</div>;
  }

  const provenancePct =
    stats.questions > 0
      ? Math.round((stats.questions_with_provenance / stats.questions) * 100)
      : 0;
  const briefPct =
    stats.patterns > 0
      ? Math.round((stats.patterns_with_brief / stats.patterns) * 100)
      : 0;
  const healthColor =
    stats.content_health >= 80
      ? "bg-success-green"
      : stats.content_health >= 50
        ? "bg-warning-amber"
        : "bg-danger-red";

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
      <p className="mt-1 text-sm text-text-muted">
        Overview of the content that powers all 4 feature modules.
      </p>

      {/* Primary content stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<BookOpen className="h-5 w-5 text-primary-blue" />}
          value={String(stats.exams)}
          label="Exams"
          sublabel={`${stats.papers} papers`}
        />
        <StatCard
          icon={<Database className="h-5 w-5 text-warning-amber" />}
          value={String(stats.questions)}
          label="Questions"
          sublabel={`across ${stats.papers} papers`}
        />
        <StatCard
          icon={<BarChart3 className="h-5 w-5 text-success-green" />}
          value={`${provenancePct}%`}
          label="With Provenance"
          sublabel={`${stats.questions_with_provenance} of ${stats.questions} questions`}
          progress={provenancePct}
          progressColor="bg-success-green"
        />
        <StatCard
          icon={<Sparkles className="h-5 w-5 text-purple-accent" />}
          value={String(stats.topic_intelligence_cache)}
          label="TI Cache Entries"
          sublabel="Topic intelligence narratives cached"
        />
        <StatCard
          icon={<ListChecks className="h-5 w-5 text-info-teal" />}
          value={String(stats.tests)}
          label="Tests"
          sublabel={`${stats.test_categories} categories`}
        />
        <StatCard
          icon={<Zap className="h-5 w-5 text-danger-red" />}
          value={`${stats.patterns} · ${briefPct}%`}
          label="Patterns"
          sublabel={`${stats.patterns_with_brief} briefs generated · ${stats.patterns} total`}
          progress={briefPct}
          progressColor="bg-primary-blue"
        />
        <StatCard
          icon={<MessageSquare className="h-5 w-5 text-info-teal" />}
          value={String(stats.mentorship_questions)}
          label="Doubts"
          sublabel={`${stats.mentorship_pending} awaiting reply`}
        />
      </div>

      {/* Health + activity row */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Content Health */}
        <div className="rounded-xl border border-card-border bg-white p-5 lg:col-span-1">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-primary-blue" />
            <h3 className="text-sm font-bold text-text-primary">Content Health</h3>
          </div>
          <div className="mt-3 flex items-end gap-3">
            <span className={`text-3xl font-bold ${healthColor === "bg-success-green" ? "text-success-green" : healthColor === "bg-warning-amber" ? "text-warning-amber" : "text-danger-red"}`}>
              {stats.content_health}
            </span>
            <span className="mb-1 text-sm text-text-muted">/ 100</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full ${healthColor}`}
              style={{ width: `${Math.min(100, stats.content_health)}%` }}
            />
          </div>
          <dl className="mt-3 space-y-1 text-xs">
            <div className="flex justify-between">
              <dt className="text-text-muted">Unclassified</dt>
              <dd className="font-medium text-text-secondary">{stats.unclassified_count}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-muted">No correct answer</dt>
              <dd className="font-medium text-text-secondary">{stats.no_correct_count}</dd>
            </div>
          </dl>
        </div>

        {/* Recent Import Activity */}
        <div className="rounded-xl border border-card-border bg-white p-5 lg:col-span-2">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-info-teal" />
            <h3 className="text-sm font-bold text-text-primary">Recent Activity</h3>
          </div>
          {stats.recent_imports.length === 0 ? (
            <p className="mt-3 text-sm text-text-muted">No imports yet. Use Bulk Import to get started.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {stats.recent_imports.map((imp) => (
                <div
                  key={imp.batch_id}
                  className="flex items-center justify-between rounded-lg border border-card-border px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-text-primary">{imp.filename}</p>
                    <p className="text-xs text-text-muted">
                      Batch #{imp.batch_id}
                      {imp.uploaded_at ? ` · ${new Date(imp.uploaded_at).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2 text-xs">
                    <span className="font-medium text-success-green">{imp.committed} committed</span>
                    {imp.duplicates > 0 && (
                      <span className="text-warning-amber">{imp.duplicates} dupes</span>
                    )}
                    {imp.needs_review > 0 && (
                      <span className="text-danger-red">{imp.needs_review} review</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Feature map */}
      <div className="mt-8 rounded-xl border border-card-border bg-white p-5">
        <h3 className="text-sm font-bold text-text-primary">How the 4 features use this data</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <FeatureMap
            icon={<Sparkles className="h-4 w-4 text-purple-accent" />}
            title="Topic Intelligence"
            desc="Reads questions grouped by subject/topic/subtopic. Clear the TI cache here after adding questions."
          />
          <FeatureMap
            icon={<Layers className="h-4 w-4 text-primary-blue" />}
            title="PYQ Deep Decode"
            desc="Per-question provenance (source guess, breakdown, fairness). Regenerate or clear per question."
          />
          <FeatureMap
            icon={<ListChecks className="h-4 w-4 text-info-teal" />}
            title="Topic Mastery"
            desc="Tests built from a 3-level category tree with assigned questions. Manage categories, tests, and assignments."
          />
          <FeatureMap
            icon={<Zap className="h-4 w-4 text-warning-amber" />}
            title="Pattern X-Ray"
            desc="Recurring question patterns with linked questions. Manage categories, patterns, and question links."
          />
          <FeatureMap
            icon={<MessageSquare className="h-4 w-4 text-info-teal" />}
            title="Mentorship"
            desc="Student doubts and guidance conversations. Reply to doubts, track status from pending → answered → resolved."
          />
        </div>
      </div>
    </div>
  );
}

function FeatureMap({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-card-border p-3">
      <span className="mt-0.5">{icon}</span>
      <div>
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <p className="mt-0.5 text-xs text-text-secondary">{desc}</p>
      </div>
    </div>
  );
}
