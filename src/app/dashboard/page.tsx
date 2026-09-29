"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import AccordionRow from "@/components/AccordionRow";
import {
  BookOpen,
  Newspaper,
  Pencil,
  Target,
  Zap,
  GraduationCap,
  Search,
  X,
  ShieldCheck,
} from "lucide-react";

const accordionItems = [
  {
    icon: <GraduationCap className="h-5 w-5 text-text-secondary" />,
    iconBg: "bg-gray-100",
    title: "Topic Intelligence Report",
    subtitle: "RECON · BEFORE YOU STUDY",
    quote:
      "I'm about to start a new topic. Before I dive in, I want to know — how important is this really?",
    body: "Before you invest hours into a chapter, let's do the homework together. I'll scan 25+ years of UPSC papers to show you:",
    bullets: [
      "Is this a <strong>high-frequency goldmine</strong> or a rare appearance?",
      "Which <strong>specific areas</strong> within this topic get asked repeatedly?",
      "What's the <strong>strategic time investment</strong> — skim, study, or master?",
    ],
    tagline:
      "Think of it as reconnaissance before deployment. Smart soldiers scout first.",
    buttonLabel: "Get Topic Intelligence →",
    buttonVariant: "primary" as const,
    buttonHref: "/topic-intelligence",
  },
  {
    icon: <Search className="h-5 w-5 text-primary-blue" />,
    iconBg: "bg-danger-bg",
    title: "PYQ Deep Decode",
    subtitle: "DECODE · THE EXAMINER'S MIND",
    quote:
      "I want to understand how UPSC thinks. What are the subtle patterns I'm missing?",
    body: "UPSC doesn't just ask questions — they craft psychological puzzles. Let me decode the DNA of their papers:",
    bullets: [
      "How do they <strong>frame options</strong> to create traps?",
      "What <strong>hidden clues</strong> exist in the question stem?",
      "How should you <strong>rewire your reading</strong> to think like an examiner?",
      "Navigate to <strong>recent year questions</strong> or explore patterns across any year",
    ],
    tagline:
      "This isn't about solving questions. It's about understanding the mind behind them.",
    buttonLabel: "Decode the Patterns →",
    buttonVariant: "primary" as const,
    buttonHref: "/questions/2",
  },
  {
    icon: <Target className="h-5 w-5 text-danger-red" />,
    iconBg: "bg-danger-bg",
    title: "Topic Mastery Test",
    subtitle: "VALIDATE · APPLICATION, NOT MEMORY",
    quote:
      "I've finished a topic. Now I want the real test — not just memory, but UPSC-level application.",
    body: "You've read, revised, and feel ready. But are you *really* ready? I'll immerse you in a focused test built from actual UPSC patterns:",
    bullets: [
      "Identify your <strong>recurring blind spots</strong> and biases",
      "See which <strong>traps you consistently fall into</strong>",
      "Get a brutally honest <strong>mastery score</strong> with actionable gaps",
    ],
    tagline:
      "Finishing a topic is step one. Owning it is what gets you the rank.",
    buttonLabel: "Test My Mastery →",
    buttonVariant: "primary" as const,
    buttonHref: "/test-series",
    buttonPrefetch: false,
  },
  {
    icon: <Zap className="h-5 w-5 text-warning-amber" />,
    iconBg: "bg-warning-bg",
    title: "Pattern X-Ray",
    subtitle: "PRIORITISE · HIGH-ZONE QUESTIONS",
    quote:
      "I don't have time for everything. Give me the questions that matter most.",
    body: "Not all questions are equal. Some topics are UPSC's favorites — asked repeatedly, twisted cleverly, and worth disproportionate marks. I've identified the **epicentres** through deep pattern analysis:",
    bullets: [
      "Questions from <strong>high-frequency zones</strong>",
      "Concepts that appear in <strong>multiple forms</strong> across years",
      "Maximum marks potential with <strong>minimum time investment</strong>",
    ],
    tagline: "This is strategic practice. Quality over quantity.",
    buttonLabel: "Explore Pattern X-Ray →",
    buttonVariant: "primary" as const,
    buttonHref: "/pattern-xray",
    buttonPrefetch: false,
  },
  {
    icon: <Pencil className="h-5 w-5 text-warning-amber" />,
    iconBg: "bg-warning-bg",
    title: "Essay Evaluation & Coaching",
    subtitle: "WRITE · ELEVATE YOUR SCRIPT",
    quote:
      "I've written an essay. I need more than a score — I need to become a better writer.",
    body: "An essay isn't just content — it's structure, flow, perspective, and the subtle art of persuasion. Approaches evaluates like a UPSC examiner, then teaches like a mentor:",
    bullets: [
      "<strong>Structure analysis</strong> — Does it breathe or suffocate?",
      "<strong>Content gaps</strong> — What's missing that examiners expect?",
      "<strong>Upgrade roadmap</strong> — Specific changes to level up",
    ],
    tagline: "From 'average' to 'rank-worthy' — one essay at a time.",
    buttonLabel: "Evaluate My Essay →",
    buttonVariant: "primary" as const,
    buttonHref: "/writing-lab/essay/new",
  },
  {
    icon: <BookOpen className="h-5 w-5 text-text-secondary" />,
    iconBg: "bg-gray-100",
    title: "GS Answer Lab",
    subtitle: "ANSWER · EVERY LINE MUST EARN ITS PLACE",
    quote:
      "I've written a GS answer. Is it good enough? What am I missing?",
    body: "A 200-word answer has no room for fluff. Every line must earn its place. Approaches dissects yours:",
    bullets: [
      "<strong>Content depth</strong> — Are you hitting the core or circling it?",
      "<strong>Current affairs integration</strong> — Is it dated or dynamic?",
      "<strong>Presentation & structure</strong> — Does it look like a topper's answer?",
    ],
    tagline: "The difference between 8 marks and 12 marks is in the details.",
    buttonLabel: "Analyze My Answer →",
    buttonVariant: "primary" as const,
    buttonHref: "/writing-lab/gs-answer/new",
  },
  {
    icon: <Newspaper className="h-5 w-5 text-text-secondary" />,
    iconBg: "bg-gray-100",
    title: "Current Affairs Catch-Up",
    subtitle: "CATCH UP · ONLY WHAT MATTERS",
    quote:
      "Life happened. I've been off the news. Catch me up on what matters for the exam.",
    body: "Not all news is exam-relevant. I'll quiz you to find where your knowledge drops off, then run you through a **condensed, exam-focused briefing**:",
    bullets: [
      "Identify your <strong>knowledge cutoff date</strong>",
      "Get <strong>only what matters</strong> — no fluff, no noise",
      "Connect current events to <strong>static syllabus topics</strong>",
    ],
    tagline: "Stay sharp. Stay current. Stay ahead.",
    buttonLabel: "Invoke CARTA →",
    buttonVariant: "primary" as const,
    buttonHref: "/carta",
  },
];

export default function DashboardPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [bannerVisible, setBannerVisible] = useState(true);
  const username = "Aspirant";

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <main className="min-h-screen bg-page-bg">
      <Navbar authState="logged-in" username={username} variant="app" />

      {/* Red marquee announcement banner */}
      {bannerVisible && (
        <div className="relative flex items-center justify-center bg-primary-blue px-10 py-2.5 text-sm font-medium text-white">
          <span className="mr-2">🔥</span>
          <span>
            Ambition has no postal code. New Pattern X-Ray for Ancient India is
            live — 90 high-frequency patterns decoded.
          </span>
          <button
            onClick={() => setBannerVisible(false)}
            className="absolute right-4 rounded-full p-1 hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mx-auto max-w-[900px] px-6 py-10">
        {/* Greeting — display headline with emphasis technique */}
        <h1 className="font-display text-3xl font-extrabold leading-tight text-text-primary md:text-4xl">
          {getGreeting()},{" "}
          <span className="text-brand">{username}</span>.{" "}
          <span className="highlighter">What should we work on today?</span>
        </h1>
        <p className="micro-label mt-3 text-text-muted">
          YOUR PERSONAL COMMAND CENTRE · UPSC PATTERN INTELLIGENCE
        </p>

        <div className="my-8 h-px w-full bg-card-border" />

        {/* Accordion stack */}
        <div className="space-y-3">
          {accordionItems.map((item, i) => (
            <AccordionRow
              key={i}
              {...item}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>

      {/* Full-width black statement band */}
      <section className="mt-10 bg-navbar-bg px-6 py-16">
        <div className="mx-auto max-w-[800px] text-center">
          <p className="micro-label text-primary-blue">NOT ANOTHER COACHING ACADEMY</p>
          <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight text-white md:text-4xl">
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
    </main>
  );
}
