"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { AccentButton, GoogleLoginButton, OutlineButton } from "@/components/Buttons";
import { Badge, Pill } from "@/components/Badge";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Globe,
  GraduationCap,
  Lightbulb,
  Newspaper,
  Pencil,
  Target,
  Zap,
  X,
  Quote,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Announcement banner — red strip, dismissible                       */
/* ------------------------------------------------------------------ */
function AnnouncementBanner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="bg-primary-blue">
      <div className="relative mx-auto flex max-w-[1200px] items-center justify-center px-10 py-2.5">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <span>🔥</span>
          <span>
            UPSC Prelims 2026 Analysis is live — 100 questions audited, every
            grade backed by named drill citations.
          </span>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="absolute right-4 rounded-full p-1 text-white/80 hover:bg-white/20 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */
function HeroSection() {
  return (
    <section className="bg-page-bg px-6 py-16 md:py-20">
      <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left column */}
        <div>
          {/* Pill badge — pink-tinted bg, red text, sparkle icon */}
          <div className="mb-5 flex">
            <span className="inline-flex items-center gap-2 rounded-full bg-danger-bg px-4 py-1.5 text-xs font-semibold text-primary-blue">
              <Sparkles className="h-3.5 w-3.5" />
              Your Second Brain for UPSC
            </span>
          </div>

          {/* Display headline — exact 3-line copy */}
          <h1 className="font-display text-4xl leading-tight text-text-primary md:text-5xl">
            <span className="block">Stop guessing what to study.</span>
            <span className="block text-brand">See the pattern.</span>
            <span className="block">
              Build real{" "}
              <span className="highlighter">confidence</span>.
            </span>
          </h1>

          <p className="mt-5 text-base text-text-secondary">
            UPSC prep is overwhelming. Approaches cuts through the noise —
            crystallizing years of PYQs into a clear, strategic edge.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <AccentButton href="/dashboard" size="lg">
              Start Building Your Edge
            </AccentButton>
            <GoogleLoginButton href="/dashboard" />
          </div>

          <div className="mt-7 space-y-2.5">
            {[
              "Patterns from 20+ years of questions, crystallized",
              "Adapts to your gaps as you practice",
              "Builds strategic thinking, not dependency",
            ].map((t, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm text-text-secondary"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-blue" />
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Right column — mock cards */}
        <div className="relative">
          <div className="absolute left-0 top-0 w-64 rounded-xl border border-card-border bg-white/60 p-4 opacity-60 blur-[0.3px]">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-text-muted">
              What you see
            </p>
            <div className="space-y-2 text-xs text-text-muted">
              {[
                "Laxmikanth Ch. 12",
                "Polity notes",
                "Art. 356",
                "Governance…",
                "2019 PYQ…",
                "The Hind…",
                "Practice…",
              ].map((t, i) => (
                <div key={i} className="rounded bg-gray-100 px-2 py-1.5">
                  {t}
                </div>
              ))}
            </div>
          </div>
          <div className="relative ml-16 mt-12 w-72 rounded-xl border border-card-border bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-full bg-danger-bg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-blue">
                What Approaches Sees
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-danger-bg text-primary-blue">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
            <p className="text-sm font-bold text-text-primary">
              Crystallized Pattern
            </p>
            <p className="text-xs text-text-muted">
              Federal Tensions & Emergency
            </p>
            <div className="mt-3 space-y-2.5 text-xs">
              <div className="flex items-start gap-2 rounded-lg bg-gray-50 p-2">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-blue" />
                <span className="text-text-secondary">
                  <strong className="text-text-primary">
                    Core Pattern: Article 356 Misuse
                  </strong>{" "}
                  — Asked 4 times • Linked to SR Bommai • High ROI
                </span>
                <span className="ml-auto shrink-0 rounded bg-danger-bg px-1.5 py-0.5 text-[9px] font-bold text-primary-blue">
                  ⚡FOCUS
                </span>
              </div>
              <div className="flex items-start gap-2 rounded-lg bg-gray-50 p-2">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-blue" />
                <span className="text-text-secondary">
                  <strong className="text-text-primary">
                    You've read this, never practiced
                  </strong>{" "}
                  — Gap detected • 3 related questions pending
                </span>
              </div>
              <div className="flex items-start gap-2 rounded-lg bg-gray-50 p-2">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-blue" />
                <span className="text-text-secondary">
                  <strong className="text-text-primary">
                    Connect: Sarkaria → Punchhi → 2023
                  </strong>{" "}
                  — Hidden linkage others miss
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blockquote card — serif italic, red left border */}
      <div className="mx-auto mt-14 max-w-2xl rounded-xl border border-card-border bg-white p-6">
        <div className="border-l-[5px] border-primary-blue pl-5">
          <p className="font-quote text-xl italic leading-relaxed text-text-primary">
            "The best way to predict what's ahead is to master how it{" "}
            <strong className="text-brand">repeats</strong>."
          </p>
          <p className="mt-3 text-xs font-semibold not-italic text-text-muted">
            — A topper, CSE 2023
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  The Problem — cream band                                           */
/* ------------------------------------------------------------------ */
function ProblemSection() {
  return (
    <section className="bg-cream px-6 py-16">
      <div className="mx-auto max-w-[1200px]">
        <div className="text-center">
          <p className="micro-label text-primary-blue">THE PROBLEM</p>
          <h2 className="mt-3 font-display text-3xl  text-text-primary md:text-4xl">
            You're supposed to connect{" "}
            <span className="text-brand">all of this.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-text-secondary">
            Connecting all these sources and patterns is hard to do consistently.
            Approaches does the stitching—so you focus on learning.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {/* Left card */}
          <div className="rounded-xl border border-card-border bg-white p-6">
            <div className="mb-5 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-text-muted" />
              <span className="micro-label text-text-muted">
                Your World Today
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  icon: (
                    <BookOpen className="h-5 w-5 text-text-secondary" />
                  ),
                  n: "20+",
                  l: "Standard Books",
                },
                {
                  icon: (
                    <Newspaper className="h-5 w-5 text-text-secondary" />
                  ),
                  n: "100+",
                  l: "Test PDFs",
                },
                {
                  icon: <Globe className="h-5 w-5 text-text-secondary" />,
                  n: "∞",
                  l: "YouTube & Telegram",
                },
                {
                  icon: (
                    <Newspaper className="h-5 w-5 text-text-secondary" />
                  ),
                  n: "12/yr",
                  l: "Monthly Magazines",
                },
              ].map((t, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center rounded-lg bg-gray-50 py-6 text-center"
                >
                  {t.icon}
                  <span className="mt-2 text-xl font-bold text-text-primary">
                    {t.n}
                  </span>
                  <span className="text-xs text-text-muted">{t.l}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-lg border border-card-border px-4 py-2.5 text-sm text-text-secondary">
              <Clock className="h-4 w-4 text-text-muted" />
              You see <strong className="text-text-primary">content</strong>.
              Disconnected. Overwhelming.
            </div>
          </div>

          {/* Right card — dark feature card */}
          <div className="rounded-xl bg-navbar-bg p-6 text-white">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary-blue" />
                <span className="micro-label text-primary-blue">
                  Approaches' World
                </span>
              </div>
              <span className="rounded-full bg-primary-blue px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                What You Get
              </span>
            </div>
            <div className="space-y-4">
              {[
                "Repeated micro-concepts — across all your sources",
                "Patterns in tough questions — from recent years",
                "Topics you keep getting wrong — tracked and surfaced",
                "Over-read, under-asked — so you don't waste time",
              ].map((t, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-blue" />
                  <p className="text-sm text-white/80">
                    <strong className="text-white">{t.split("—")[0]}</strong>
                    {t.includes("—") && (
                      <span className="text-white/50">
                        {" — "}
                        {t.split("—")[1]}
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm text-white">
              <CheckCircle2 className="h-4 w-4 text-primary-blue" />
              It sees{" "}
              <strong className="text-white">patterns, gaps, and paths.</strong>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-card-border bg-white text-primary-blue shadow-sm">
            <ArrowRight className="h-5 w-5" />
          </span>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Super-Aspirant                                                     */
/* ------------------------------------------------------------------ */
function SuperAspirantSection() {
  const leftRows = [
    "You read what everyone reads, <em>hoping it sticks</em>.",
    "You guess what to revise based on <em>gut feeling</em>.",
    "You're never sure if you're <em>missing something obvious</em>.",
    "You write answers based on <em>what you recall at that moment</em>.",
    "You have no way to compare your script against a topper's.",
  ];
  const rightRows = [
    "You read what everyone reads, but <strong>revise what they miss.</strong>",
    "Your revision has a clear, <strong>data-backed reason.</strong>",
    "Your answers include <strong>2-3 extra angles</strong> most scripts lack.",
    "Your next study block is <strong>the highest-impact task</strong> you can do.",
    "You see exactly where your script stands <strong>against topper benchmarks.</strong>",
  ];
  return (
    <section className="bg-page-bg px-6 py-16">
      <div className="mx-auto max-w-[1200px] text-center">
        <p className="micro-label text-primary-blue">YOU + APPROACHES</p>
        <h2 className="mt-3 font-display text-3xl  text-text-primary md:text-4xl">
          You{" "}
          <span className="mx-2 font-normal text-text-muted">+</span>{" "}
          <span className="text-brand">Approaches</span>{" "}
          <span className="mx-2 font-normal text-text-muted">=</span>{" "}
          <span className="highlighter">Super-Aspirant</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-text-secondary">
          It's not a replacement for your hard work. It's a{" "}
          <strong className="text-text-primary">strategic upgrade</strong> to
          how you apply it.
        </p>
      </div>

      <div className="relative mx-auto mt-12 grid max-w-[1200px] gap-8 lg:grid-cols-2">
        {/* Left */}
        <div className="rounded-xl border border-card-border bg-white p-6">
          <div className="mb-5 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-text-muted">
              <span className="text-sm">👤</span>
            </span>
            <span className="text-sm font-bold text-text-primary">
              You Alone
            </span>
          </div>
          <div className="space-y-3">
            {leftRows.map((r, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full border border-text-muted" />
                <p
                  className="text-sm italic text-text-secondary"
                  dangerouslySetInnerHTML={{ __html: r }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* VS badge */}
        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-card-border bg-white text-xs font-bold text-text-muted shadow-sm">
            vs
          </span>
        </div>

        {/* Right */}
        <div className="rounded-xl border-2 border-primary-blue/40 bg-danger-bg/30 p-6">
          <div className="mb-5 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-danger-bg text-primary-blue">
              <span className="text-sm">👥</span>
            </span>
            <span className="text-sm font-bold text-primary-blue">
              You + Approaches
            </span>
          </div>
          <div className="space-y-3">
            {rightRows.map((r, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 rounded-lg p-2 ${
                  i === 3 ? "bg-danger-bg" : ""
                }`}
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-blue" />
                <p
                  className="text-sm text-text-secondary"
                  dangerouslySetInnerHTML={{ __html: r }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Essay & GS Mains Engine                                            */
/* ------------------------------------------------------------------ */
function MainsEngineSection() {
  return (
    <section className="bg-cream px-6 py-16">
      <div className="mx-auto max-w-[1200px]">
        <div className="text-center">
          <div className="mb-3 flex items-center justify-center gap-3">
            <p className="micro-label text-primary-blue">
              ESSAY & GS MAINS ENGINE
            </p>
            <span className="rounded-full bg-navbar-bg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              ⊙ Powered by AI
            </span>
          </div>
          <h2 className="font-display text-3xl  text-text-primary md:text-4xl">
            From Average Script to{" "}
            <span className="text-brand">High-Band Writing</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-text-secondary">
            Not grammar checking. Not vague feedback. A deep x-ray of your script
            across the dimensions examiners actually look for — teaching you to
            write like someone who clears.
          </p>
          <div className="mt-7 flex justify-center">
            <AccentButton size="lg" href="/writing-lab">
              ⚡ Upgrade My Writing
            </AccentButton>
          </div>
          <p className="mt-2 text-xs text-text-muted">
            No signup required • Instant analysis
          </p>
        </div>

        {/* 3-col workspace mockup */}
        <div className="mt-12 grid gap-4 rounded-2xl border border-card-border bg-white p-5 md:grid-cols-3">
          {/* Col 1 */}
          <div className="rounded-xl border border-card-border bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-bold text-text-primary">
                <Pencil className="h-4 w-4 text-text-secondary" />
                Your Answer
              </span>
              <span className="rounded-full bg-danger-bg px-2 py-0.5 text-[10px] font-bold text-primary-blue">
                ● AI Scanning
              </span>
            </div>
            <div className="space-y-2 text-xs">
              {[
                {
                  n: "1",
                  t: "India's federal structure has ",
                  h: "evolved significantly",
                },
                { n: "2", t: "The ", h: "Finance Commission" },
                { n: "3", t: "However, ", h: "fiscal federalism" },
                { n: "4", t: "The ", h: "Sarkaria Commission" },
                { n: "5", t: "In conclusion, ", h: "cooperative federalism" },
              ].map((r, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded bg-gray-50 p-2"
                >
                  <span className="font-bold text-text-muted">{r.n}</span>
                  <span className="text-text-secondary">
                    {r.t}
                    <span className="underline decoration-primary-blue/40">
                      {r.h}
                    </span>
                    .
                  </span>
                  <CheckCircle2 className="ml-auto h-3.5 w-3.5 shrink-0 text-primary-blue" />
                </div>
              ))}
            </div>
          </div>

          {/* Col 2 */}
          <div className="rounded-xl border border-card-border bg-white p-4">
            <div className="mb-3 flex flex-col items-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-danger-bg text-primary-blue">
                <Target className="h-5 w-5" />
              </span>
              <span className="mt-2 text-sm font-bold text-text-primary">
                AI Rubric Engine
              </span>
              <span className="text-[10px] text-text-muted">
                Comparing against 1000+ high-scoring patterns
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { l: "Hook / Opening", r: "Weak", c: "bg-danger-red" },
                { l: "Thesis / Argument", r: "Fair", c: "bg-warning-amber" },
                { l: "Institutional Angle", r: "Missing", c: "bg-danger-red" },
                { l: "Current Affairs", r: "Missing", c: "bg-danger-red" },
                { l: "Structure / Roadmap", r: "Fair", c: "bg-warning-amber" },
                { l: "Critical Analysis", r: "Fair", c: "bg-warning-amber" },
                {
                  l: "Language & Clarity",
                  r: "Good",
                  c: "bg-success-green",
                },
                { l: "Conclusion", r: "Weak", c: "bg-danger-red" },
              ].map((t, i) => (
                <div key={i} className="rounded-lg bg-gray-50 p-2">
                  <p className="text-[10px] font-semibold text-text-primary">
                    {t.l}
                  </p>
                  <p className="text-[10px] font-bold text-text-muted">
                    {t.r}
                  </p>
                  <div className={`mt-1 h-0.5 w-8 rounded-full ${t.c}`} />
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-lg bg-gray-50 p-2 text-[10px] text-text-secondary">
              <strong className="text-text-primary">KEY FINDINGS:</strong> 4
              dimensions need immediate attention.
            </div>
          </div>

          {/* Col 3 */}
          <div className="rounded-xl border border-card-border bg-white p-4">
            <p className="mb-3 text-sm font-bold text-text-primary">
              Upgrade Plan
            </p>
            <p className="mb-3 text-[10px] text-text-muted">
              Next 1-2 Attempts
            </p>
            <div className="space-y-2.5">
              {[
                {
                  pill: "HIGH IMPACT",
                  pc: "bg-primary-blue",
                  l: "Hook / Opening",
                  t: "Try → Open with a concrete image",
                },
                {
                  pill: "HIGH IMPACT",
                  pc: "bg-primary-blue",
                  l: "Current Affairs",
                  t: "Add → Post-2022 examples",
                },
                {
                  pill: "MEDIUM IMPACT",
                  pc: "bg-navbar-bg",
                  l: "Institutional Depth",
                  t: "Add → 2nd ARC reference",
                },
                {
                  pill: "MEDIUM IMPACT",
                  pc: "bg-navbar-bg",
                  l: "Conclusion",
                  t: "Try → Tie to larger theme",
                },
              ].map((c, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-card-border p-2.5"
                >
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold text-white ${c.pc}`}
                  >
                    {c.pill}
                  </span>
                  <p className="mt-1 text-xs font-bold text-text-primary">
                    {c.l}
                  </p>
                  <p className="text-[10px] text-text-muted">{c.t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ISSUES DETECTED panel */}
        <div className="mt-6 rounded-xl border border-card-border bg-white p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-text-primary">
              ISSUES DETECTED
            </span>
            {[
              "Generic Opening",
              "No Current Affairs",
              "Weak Conclusion",
              "No 2nd ARC",
            ].map((c, i) => (
              <Badge key={i} variant="red">
                {c}
              </Badge>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-6">
            <div>
              <p className="text-xs text-text-muted">CURRENT BAND</p>
              <p className="text-2xl font-bold text-text-primary">4-5/10</p>
              <div className="mt-1 h-1.5 w-40 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full w-[45%] rounded-full bg-warning-amber" />
              </div>
            </div>
            <div>
              <p className="text-xs text-text-muted">Band Projection</p>
              <div className="mt-1 flex gap-1.5">
                {["0-3", "4-5", "6-7", "8+"].map((b, i) => (
                  <span
                    key={i}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      i === 1
                        ? "bg-navbar-bg text-white"
                        : "bg-gray-100 text-text-secondary"
                    }`}
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button className="rounded-full bg-primary-blue px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-blue-dark">
              Get Full Analysis →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Writer Evolution                                                   */
/* ------------------------------------------------------------------ */
function WriterEvolutionSection() {
  return (
    <section className="bg-page-bg px-6 py-16">
      <div className="mx-auto max-w-[1200px] rounded-2xl border border-card-border bg-white p-8">
        <div className="text-center">
          <Pill variant="brand" className="mb-3">
            ▍Writer Evolution
          </Pill>
          <h2 className="font-display text-3xl  text-text-primary">
            This isn't feedback. It's{" "}
            <span className="text-brand">training.</span>
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-text-secondary">
            Over repeated attempts, Approaches rewires how you open, argue, and
            close — across all topics.
          </p>
        </div>

        <div className="relative mt-10 grid gap-8 lg:grid-cols-2">
          {/* Before */}
          <div className="rounded-xl border border-card-border p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-text-muted" />
              <span className="micro-label text-text-muted">Before</span>
            </div>
            <div className="space-y-3">
              {[
                "Generic openings with textbook definitions",
                "No current affairs or recent examples",
                "Flat, repetitive conclusions",
                "Missing institutional depth",
              ].map((t, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-sm text-text-secondary"
                >
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
                  {t}
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-card-border pt-4">
              <span className="micro-label text-text-muted">Writing Band</span>
              <span className="text-sm font-bold text-text-primary">
                3-4 / 10
              </span>
            </div>
          </div>

          {/* Arrow */}
          <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-card-border bg-white text-primary-blue shadow-sm">
              <ArrowRight className="h-5 w-5" />
            </span>
          </div>

          {/* After — dark card */}
          <div className="rounded-xl bg-navbar-bg p-6 text-white">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary-blue" />
              <span className="micro-label text-primary-blue">
                After Approaches
              </span>
            </div>
            <div className="space-y-3">
              {[
                "Hooks with concrete images or recent events",
                "2-3 post-2022 current affairs woven in",
                "Conclusions tie back to larger themes",
                "Institutional frameworks referenced naturally",
              ].map((t, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-sm text-white/80"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-blue" />
                  {t}
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
              <span className="micro-label text-white/50">Writing Band</span>
              <span className="text-sm font-bold text-primary-blue">
                6-7 / 10
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <AccentButton href="/writing-lab">↻ Try Your First Analysis</AccentButton>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  How Approaches Thinks                                              */
/* ------------------------------------------------------------------ */
function PipelineSection() {
  return (
    <section className="bg-cream px-6 py-16">
      <div className="mx-auto max-w-[1200px] text-center">
        <p className="micro-label text-primary-blue">
          INTELLIGENCE PIPELINE
        </p>
        <h2 className="mt-3 font-display text-3xl  text-text-primary md:text-4xl">
          How Approaches{" "}
          <span className="text-brand">Thinks</span>
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-text-secondary">
          Watch what happens when you attempt a single question. It's not just
          feedback — it's a complete intelligence operation running in real-time.
        </p>
        <div className="mt-7 flex justify-center">
          <button className="rounded-full bg-navbar-bg px-6 py-3 text-sm font-semibold text-white hover:bg-navbar-bg-2">
            ▷ Watch the Pipeline
          </button>
        </div>

        {/* Abstract pipeline visual */}
        <div className="mx-auto mt-10 flex h-48 max-w-md items-center justify-center">
          <div className="relative flex h-40 w-40 items-center justify-center">
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-dashed border-primary-blue/30 [animation-duration:20s]" />
            <div className="absolute inset-6 rounded-full border-2 border-dashed border-primary-blue/20" />
            <div className="absolute inset-12 rounded-full border-2 border-dashed border-primary-blue/10" />
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-danger-bg text-xs font-bold text-primary-blue">
              AI
            </span>
            <span className="absolute left-2 top-8 h-2 w-2 rounded-full bg-primary-blue" />
            <span className="absolute bottom-6 right-3 h-2 w-2 rounded-full bg-primary-blue-dark" />
            <span className="absolute right-8 top-2 h-2 w-2 rounded-full bg-danger-red" />
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-2xl text-sm text-text-secondary">
          You don't just get an answer. You get{" "}
          <strong className="text-text-primary">
            a model of how you should have studied
          </strong>{" "}
          — and a lens to see similar questions like a pattern-recognition
          machine.
        </p>

        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-8 md:grid-cols-4">
          {[
            { n: "5", l: "Data Sources" },
            { n: "15+", l: "Years of PYQs" },
            { n: "<2s", l: "Processing Time" },
            { n: "∞", l: "Pattern Memory" },
          ].map((s, i) => (
            <div key={i}>
              <p className="font-display text-3xl  text-brand">
                {s.n}
              </p>
              <p className="mt-1 text-xs text-text-muted">{s.l}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <AccentButton size="lg" href="/dashboard">
            Experience the Intelligence
          </AccentButton>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Test Series                                                        */
/* ------------------------------------------------------------------ */
function TestSeriesSection() {
  return (
    <section className="bg-page-bg px-6 py-16">
      <div className="mx-auto max-w-[1200px] text-center">
        <p className="micro-label text-primary-blue">
          INDIA'S MOST ADVANCED TEST SERIES
        </p>
        <h2 className="mt-3 font-display text-3xl  text-text-primary md:text-4xl">
          Tests That Don't Just Score.{" "}
          <span className="text-brand">They Decode Your Mind.</span>
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-text-secondary">
          Thousands of deeply researched questions built from 15+ years of PYQ
          patterns, latest exam trends, and the books you study — brought to the
          level UPSC actually expects.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {[
            "📘 PYQ Pattern Analysis",
            "📈 Latest Exam Trends",
            "📖 Book-to-Exam Level",
            "🌐 Cognitive Blueprint",
          ].map((c, i) => (
            <Badge key={i} variant="neutral" className="px-3 py-1.5 text-xs">
              {c}
            </Badge>
          ))}
        </div>
      </div>

      {/* Knowledge + Behavioral */}
      <div className="mx-auto mt-10 max-w-[1200px] rounded-2xl border border-card-border bg-white p-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger-bg text-primary-blue">
              <BookOpen className="h-5 w-5" />
            </span>
            <h3 className="mt-3 text-lg font-bold text-text-primary">
              Knowledge Testing
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              Curated questions that test concepts exactly how UPSC frames them
            </p>
          </div>
          <div>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navbar-bg text-white">
              <Globe className="h-5 w-5" />
            </span>
            <h3 className="mt-3 text-lg font-bold text-text-primary">
              Behavioral Debugging
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              A cognitive x-ray that finds invisible patterns killing your score
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-[1200px] text-center">
        <Pill variant="dark">● Behavioral Diagnostics</Pill>
        <h2 className="mt-4 font-display text-3xl  text-text-primary md:text-4xl">
          Don't Just Test Knowledge. Debug Your Brain.
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-text-secondary">
          Most platforms tell you{" "}
          <strong className="text-text-primary">what</strong> you got wrong. We
          tell you <strong className="text-text-primary">why</strong>.
        </p>
        <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-danger-bg px-4 py-2.5 text-sm text-primary-blue">
          <span>⚠️</span>
          <strong>~20 Invisible Marks Lost Per Test</strong>
          <span className="text-text-secondary">
            — Not from lack of knowledge — from behavioral leaks.
          </span>
        </div>
      </div>

      {/* Precision Prescription banner */}
      <div className="mx-auto mt-10 max-w-[1200px] overflow-hidden rounded-2xl bg-navbar-bg">
        <div className="flex flex-col items-start justify-between gap-4 p-8 md:flex-row md:items-center">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-blue font-display text-lg font-bold text-white">
              A
            </span>
            <div>
              <h3 className="text-lg font-bold text-white">
                Your Precision Prescription
              </h3>
              <p className="text-sm text-gray-400">
                Not just a score — a personalized repair plan.
              </p>
            </div>
          </div>
          <button className="rounded-full bg-primary-blue px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-blue-dark">
            Start Free Test →
          </button>
        </div>
        <div className="grid grid-cols-1 gap-px bg-card-border md:grid-cols-3">
          {[
            {
              l: "DIAGNOSIS",
              t: "Cross-Linked Economy",
              s: "Weak on Economy + Polity combos",
              icon: <Target className="h-5 w-5 text-primary-blue" />,
            },
            {
              l: "PRESCRIPTION",
              t: "20 Mixed Questions",
              s: "Economy + Polity drills this week",
              icon: <Lightbulb className="h-5 w-5 text-primary-blue" />,
            },
            {
              l: "PROGNOSIS",
              t: "Next Mock Improvement",
              s: "+8 Marks",
              icon: <Zap className="h-5 w-5 text-success-green" />,
            },
          ].map((c, i) => (
            <div key={i} className="bg-white px-6 py-5 text-center md:text-left">
              <div className="flex justify-center md:justify-start">
                {c.icon}
              </div>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                {c.l}
              </p>
              <p className="mt-1 text-sm font-bold text-text-primary">
                {c.t}
              </p>
              <p className="text-xs text-text-secondary">{c.s}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Examiner Mode                                                      */
/* ------------------------------------------------------------------ */
function ExaminerModeSection() {
  return (
    <section className="bg-cream px-6 py-16">
      <div className="mx-auto max-w-[1200px] text-center">
        <Pill variant="brand" className="mb-3">
          ☆ Examiner Mode
        </Pill>
        <h2 className="font-display text-3xl  text-text-primary md:text-4xl">
          Stop Guessing the Paper.{" "}
          <span className="text-brand">Start Setting It.</span>
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-text-secondary">
          Switch from Student Mode to Examiner Mode. Use our AI to frame the
          exact questions UPSC is likely to ask next — from any source, any
          topic.
        </p>
      </div>

      {/* Question Creation Engine */}
      <div className="mx-auto mt-10 max-w-[1200px] rounded-2xl border border-card-border bg-white p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-bold text-text-primary">
            ⚡ Question Creation Engine
          </h3>
          <Badge variant="brand">● Intelligence Active</Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Step 1 */}
          <div>
            <p className="mb-3 micro-label text-text-muted">
              Step 1 — Select Your Source
            </p>
            <p className="mb-3 text-xs text-text-secondary">
              Pick any topic from your study material
            </p>
            <div className="rounded-xl border-2 border-primary-blue bg-white p-4">
              <p className="text-sm font-bold text-text-primary">
                📘 Standard Polity Textbook
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Indian Polity › Constitutional Bodies
              </p>
              <p className="mt-2 text-xs italic text-text-secondary">
                "The <strong>Finance Commission</strong> is a constitutional body
                constituted under Article 280..."
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div>
            <p className="mb-3 micro-label text-text-muted">
              Step 2 — AI Intelligence
            </p>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {[
                "⇄ Official PIB",
                "💬 News Archives",
                "📘 15 Yr PYQs",
                "📈 Recent Trends",
              ].map((c, i) => (
                <Badge key={i} variant="neutral" className="text-[10px]">
                  {c}
                </Badge>
              ))}
            </div>
            <div className="mb-3 flex justify-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-primary-blue text-xs font-bold text-primary-blue">
                ⊕ ANALYZING
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { l: "GAP FOUND", s: "Not asked since 2018" },
                { l: "IMPORTANCE", s: "High (Recent amendments)" },
                { l: "TRAP POTENTIAL", s: "Body-type confusion" },
                { l: "PREDICTION", s: "Likely in 2025" },
              ].map((t, i) => (
                <div key={i} className="rounded-lg bg-gray-50 p-2 text-[10px]">
                  <p className="font-bold text-text-primary">🔍 {t.l}</p>
                  <p className="text-text-muted">{t.s}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Step 3 */}
          <div>
            <p className="mb-3 micro-label text-text-muted">
              Step 3 — Generated Question
            </p>
            <p className="mb-3 text-xs text-text-secondary">
              UPSC-style, ready to practice
            </p>
            <div className="rounded-xl bg-navbar-bg p-4 text-white">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  ★ AI Generated
                </span>
                <span className="rounded-full bg-primary-blue px-2 py-0.5 text-[10px] font-bold">
                  Predicted 2025
                </span>
              </div>
              <p className="text-xs font-semibold">
                Consider the following statements about the Finance Commission:
              </p>
              <p className="mt-1.5 text-xs">
                1. It is a constitutional body under Article 280.
              </p>
              <p className="mt-0.5 text-xs">
                2. It is a permanent body with fixed tenure.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[
                  "A) 1 only",
                  "B) 2 only",
                  "C) Both 1 and 2",
                  "D) Neither",
                ].map((o, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-white/20 px-2 py-1 text-[10px]"
                  >
                    {o}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* WHY THIS QUESTION callout */}
        <div className="mt-5 rounded-lg border border-warning-amber/40 bg-warning-bg p-3 text-xs text-text-secondary">
          <strong className="text-warning-amber">WHY THIS QUESTION?</strong>{" "}
          UPSC has not tested the Finance Commission's constitutional status since
          2018, and recent amendments make it high-probability for 2025.
        </div>
      </div>

      {/* Trap Architect */}
      <div className="mx-auto mt-8 max-w-[1200px] rounded-xl border border-card-border bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-danger-bg">
            <ArrowRight className="h-4 w-4 text-primary-blue" />
          </span>
          <div>
            <p className="micro-label text-text-muted">Bonus Feature</p>
            <p className="text-sm font-bold text-text-primary">
              The Trap Architect
            </p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-card-border p-4">
            <Pill variant="brand" className="mb-3">
              How We Built the Trap
            </Pill>
            <p className="mb-2 micro-label text-text-muted">
              Type-3: Word Swap
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2 rounded-lg bg-success-bg p-2 text-xs text-text-secondary">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success-green" />
                Finance Commission is a <strong>Constitutional</strong> body
              </div>
              <div className="flex items-start gap-2 rounded-lg bg-gray-50 p-2 text-xs text-text-secondary">
                <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-muted" />
                Finance Commission is a <strong>Statutory</strong> body
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-danger-bg p-4 text-xs text-text-secondary">
            <p className="italic">
              "I swapped <strong>Constitutional</strong> with{" "}
              <strong>Statutory</strong> here. This is a classic Type-3 Trap —
              UPSC loves body-type confusion between Constitutional, Statutory,
              and Executive bodies. Now you know the pattern."
            </p>
          </div>
        </div>
      </div>

      <p className="mx-auto mt-8 max-w-xl text-center text-sm italic text-text-muted">
        Don't just solve the mystery.{" "}
        <strong className="text-text-primary">Learn how it's written.</strong>
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Final CTA band + Footer                                            */
/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/*  Full-width statement band — solid black                           */
/* ------------------------------------------------------------------ */
function StatementBand() {
  return (
    <section className="bg-navbar-bg px-6 py-20">
      <div className="mx-auto max-w-[800px] text-center">
        <p className="micro-label text-primary-blue">NOT ANOTHER COACHING ACADEMY</p>
        <h2 className="mt-4 font-display text-3xl leading-tight text-white md:text-4xl">
          Not more content.{" "}
          <span className="text-brand">Pattern intelligence.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-base text-white/60">
          Stop collecting PDFs. Start seeing the architecture behind every
          question UPSC has ever asked.
        </p>
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-white/40">
          <ShieldCheck className="h-4 w-4 text-primary-blue" />
          <span>Trusted by aspirants across 40+ cities in India</span>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Final CTA band + Footer                                            */
/* ------------------------------------------------------------------ */
function FinalCTA() {
  return (
    <>
      <section className="bg-page-bg px-6 py-12">
        <div className="mx-auto max-w-[1200px] rounded-2xl border border-card-border bg-danger-bg p-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="font-display text-2xl  text-text-primary">
                Don't just solve the mystery.{" "}
                <span className="text-brand">Write it.</span>
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                Create unlimited UPSC-style questions from any source, any topic.
              </p>
            </div>
            <AccentButton size="lg" href="/pyq-decode">
              Enter Examiner Mode
            </AccentButton>
          </div>
        </div>
      </section>

      <footer className="bg-navbar-bg px-6 py-6">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-3 text-xs text-white/50 md:flex-row">
          <p>© 2025 Approaches to IAS</p>
          <div className="flex gap-4">
            {["Blog", "Contact", "Disclaimer", "Privacy Policy", "Terms of Use"].map(
              (l, i) => (
                <button key={i} className="hover:text-white">
                  {l}
                </button>
              )
            )}
          </div>
        </div>
      </footer>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Page — assemble all sections                                       */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <AnnouncementBanner />
      <Navbar authState="logged-out" />
      <HeroSection />
      <ProblemSection />
      <SuperAspirantSection />
      <MainsEngineSection />
      <WriterEvolutionSection />
      <PipelineSection />
      <TestSeriesSection />
      <ExaminerModeSection />
      <StatementBand />
      <FinalCTA />
    </main>
  );
}
