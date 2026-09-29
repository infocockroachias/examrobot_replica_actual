import Navbar from "@/components/Navbar";
import { AccentButton } from "@/components/Buttons";
import Link from "next/link";
import { Pencil, FileText } from "lucide-react";

export default function WritingLabPage() {
  return (
    <main className="min-h-screen bg-page-bg">
      <Navbar authState="logged-in" username="Aspirant" variant="app" />

      {/* Hero band */}
      <div className="bg-navbar-bg px-6 py-14">
        <div className="mx-auto max-w-[1200px] text-center">
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            Stop Practicing Blind.
            <br />
            Get Real Feedback in Minutes.
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-gray-300">
            3 Marks = 50 Ranks. In UPSC, precision separates rankers from hard
            workers.
          </p>
          <p className="mt-2 text-sm text-gray-300">
            Not generic AI.{" "}
            <span className="font-semibold text-info-teal">
              A multi-dimensional thinking engine.
            </span>
          </p>

          {/* 4-step pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {["Write", "Evaluate", "Decode", "Improve"].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white">
                  {s}
                </span>
                {i < 3 && (
                  <span className="text-text-muted">→</span>
                )}
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mx-auto mt-8 flex max-w-lg flex-wrap justify-center gap-8">
            {[
              { n: "2-6 min", l: "evaluation" },
              { n: "50+", l: "parameters analyzed" },
              { n: "24/7", l: "always ready" },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-2xl font-bold text-info-teal">{s.n}</p>
                <p className="text-xs text-gray-400">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two cards */}
      <div className="mx-auto grid max-w-[1200px] gap-6 px-6 py-10 md:grid-cols-2">
        {/* Essay Evaluation */}
        <div className="rounded-xl border border-card-border bg-white p-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-accent">
            <Pencil className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-text-primary">
            Essay Evaluation
          </h2>
          <p className="mt-1 text-sm italic text-text-muted">
            Where marginal marks become incredible victories
          </p>
          <p className="mt-3 text-sm text-text-secondary">
            An essay isn't just content — it's a chess game of structure,
            perspective, and persuasion. We evaluate yours like a UPSC examiner
            and coach you like a mentor.
          </p>
          <ul className="mt-4 space-y-2.5">
            {[
              { t: "Opening Autopsy", d: "Does your hook grab or let go?" },
              { t: "Multidimensional Mapping", d: "Are you seeing all angles?" },
              { t: "Bloom's Telescope", d: "Is your thinking layered enough?" },
              { t: "Content X-Ray", d: "What's missing that examiners expect?" },
              { t: "Persuasion Engineering", d: "Does your argument convince?" },
              { t: "Closing Strike", d: "Does your conclusion resonate?" },
              { t: "Rewrite Chamber", d: "See your upgraded version instantly." },
            ].map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-accent" />
                <span className="text-text-secondary">
                  <strong className="text-text-primary">{b.t}</strong> — {b.d}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs italic text-text-muted">
            Submit when ready. One answer. Multiple evolutions.
          </p>
          <Link
            href="/writing-lab/essay/new"
            className="mt-4 block w-full rounded-lg bg-gradient-to-r from-purple-accent to-indigo-accent py-3 text-center text-sm font-semibold text-white hover:from-purple-700 hover:to-indigo-600"
          >
            → Try Essay Evaluation
          </Link>
        </div>

        {/* GS Answer Evaluation */}
        <div className="rounded-xl border border-card-border bg-white p-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-info-teal">
            <FileText className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-text-primary">
            GS Answer Evaluation
          </h2>
          <p className="mt-1 text-sm italic text-text-muted">
            Know your score before the examiner does
          </p>
          <p className="mt-3 text-sm text-text-secondary">
            We first generate an ideal answer structure for your question, then
            audit your script against it — line by line, dimension by dimension.
          </p>
          <ul className="mt-4 space-y-2.5">
            {[
              { t: "Directive Intelligence", d: "Did you do what was asked?" },
              { t: "Gap Analysis", d: "Points you missed, angles unexplored." },
              { t: "Fact Verification", d: "Dates, stats, provisions checked." },
              { t: "Current Affairs Check", d: "Outdated data flagged via live search." },
              { t: "Inline Annotations", d: "Line-by-line feedback on your script." },
              { t: "Framework Coverage", d: "PESTEL, stakeholder dimensions." },
            ].map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-info-teal" />
                <span className="text-text-secondary">
                  <strong className="text-text-primary">{b.t}</strong> — {b.d}
                </span>
              </li>
            ))}
          </ul>

          {/* GS papers legend */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              { e: "🕐", l: "GS1 History, Geography, Society" },
              { e: "🏛", l: "GS2 Polity, Governance, IR" },
              { e: "📈", l: "GS3 Economy, S&T, Environment" },
              { e: "♡", l: "GS4 Ethics, Integrity, Aptitude" },
            ].map((g, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-text-secondary"
              >
                <span>{g.e}</span>
                <span>{g.l}</span>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs italic text-text-muted">
            Submit when ready. One answer. Total clarity.
          </p>
          <Link
            href="/writing-lab/gs-answer/new"
            className="mt-4 block w-full rounded-lg bg-gradient-to-r from-info-teal to-primary-blue py-3 text-center text-sm font-semibold text-white hover:from-[#0f766e] hover:to-[#1d4ed8]"
          >
            → Try GS Evaluation
          </Link>
        </div>
      </div>
    </main>
  );
}
