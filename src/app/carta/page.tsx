"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Tabs from "@/components/Tabs";
import { Badge } from "@/components/Badge";
import { CheckCircle2 } from "lucide-react";

const themeCards = [
  {
    title: "Critical Minerals: India's Resource Security Strategy",
    tags: ["GS-2", "GS-3"],
    threads: 12,
    news: 47,
    pyqs: 8,
    findings: [
      "Critical Minerals: The 6 minerals removed from the 'Atomic Minerals' list for private mining.",
      "Semicon: India's semiconductor ambitions — fab incentives and supply chain positioning.",
      "China dependency: Rare earth processing dominance and India's counter-strategy.",
    ],
  },
  {
    title: "Green Energy Transition: Solar, Wind & Green Hydrogen Push",
    tags: ["GS-3"],
    threads: 18,
    news: 92,
    pyqs: 14,
    findings: [
      "Green Hydrogen: National Green Hydrogen Mission — targets, challenges, and global positioning.",
      "Solar manufacturing: PLI schemes and the push for domestic module production.",
      "Energy storage: Battery technology advances and grid-scale storage requirements.",
    ],
  },
  {
    title: "Digital Governance & AI Regulation Framework",
    tags: ["GS-2", "GS-3"],
    threads: 9,
    news: 34,
    pyqs: 5,
    findings: [
      "Digital India Act: Replacing the IT Act — platform regulation and intermediary liability.",
      "AI governance: India's approach to regulating artificial intelligence.",
      "Data protection: Implementation of the Digital Personal Data Protection Act.",
    ],
  },
  {
    title: "India's Strategic Defence Posture & Indigenization",
    tags: ["GS-2", "GS-3"],
    threads: 15,
    news: 63,
    pyqs: 11,
    findings: [
      "Defence production: Record highs in indigenous manufacturing and exports.",
      "QUAD & Indo-Pacific: Maritime security partnerships and strategic balancing.",
      "Border infrastructure: Roads, tunnels, and connectivity along the LAC.",
    ],
  },
  {
    title: "Water Crisis: River Linking & Interstate Disputes",
    tags: ["GS-1", "GS-2"],
    threads: 11,
    news: 41,
    pyqs: 9,
    findings: [
      "Ken-Betwa: The river linking project — ecological concerns and irrigation promises.",
      "Interstate disputes: Cauvery, Krishna-Godavari — tribunal rulings and political tensions.",
      "Groundwater depletion: NITI Aayog reports and sustainable extraction imperatives.",
    ],
  },
  {
    title: "Space Sector Reforms & ISRO's Commercial Push",
    tags: ["GS-3"],
    threads: 7,
    news: 28,
    pyqs: 6,
    findings: [
      "IN-SPACe: Opening India's space sector to private players.",
      "Gaganyaan: Human spaceflight programme status and international collaboration.",
      "Launch economics: ISRO's cost advantage and the global small-satellite market.",
    ],
  },
  {
    title: "Urban Governance: Smart Cities & Municipal Finance",
    tags: ["GS-1", "GS-2"],
    threads: 10,
    news: 36,
    pyqs: 7,
    findings: [
      "Smart Cities Mission: Outcomes, gaps, and the urban transformation agenda.",
      "Municipal bonds: Urban local bodies and innovative financing mechanisms",
      "Urban flooding: Drainage infrastructure and climate-resilient city planning.",
    ],
  },
  {
    title: "Health Architecture: Universal Coverage & Pandemic Prep",
    tags: ["GS-2"],
    threads: 13,
    news: 52,
    pyqs: 10,
    findings: [
      "Ayushman Bharat: Expanding coverage and the public-private partnership model.",
      "Pandemic preparedness: Post-COVID health infrastructure and surveillance systems.",
      "One Health: Integrating human, animal, and environmental health monitoring.",
    ],
  },
  {
    title: "Federal Finance: Finance Commission & GST Reforms",
    tags: ["GS-2", "GS-3"],
    threads: 8,
    news: 29,
    pyqs: 12,
    findings: [
      "16th Finance Commission: Terms of reference and vertical devolution debates.",
      "GST reforms: Rate rationalization, inclusion of petroleum, and compliance simplification.",
      "Fiscal federalism: Centrally sponsored schemes and the autonomy of states.",
    ],
  },
];

export default function CartaPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [activeBrief, setActiveBrief] = useState<"latest" | "week">("latest");
  const [yearToggle, setYearToggle] = useState<"2027" | "2026">("2027");

  const tabs = [
    { label: "Themes" },
    { label: "Story Arcs" },
    { label: "Lone News", count: "2871" },
    { label: "Daily News", count: "4189" },
    { label: "Answer Helper" },
  ];

  return (
    <main className="min-h-screen bg-page-bg">
      <Navbar authState="logged-in" username="Aspirant" variant="app" />

      <div className="mx-auto max-w-[1300px] px-6 py-6">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-text-primary">CARTA</h1>
          <span className="text-sm text-text-muted">
            Current Affairs Robot
          </span>
        </div>
        <p className="mt-1 text-sm text-text-secondary">
          Cutting through the noise of daily news — finding patterns, connecting
          events, and organizing everything into answer-ready insights.{" "}
          <button className="font-medium text-primary-blue underline">
            How does this work?
          </button>
        </p>
        <p className="mt-2 text-xs text-text-muted">
          4,189 news items tracked → 9 themes organized → 43 story arcs connected
        </p>

        {/* Year toggle */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-text-secondary">
            Current Affairs for:
          </span>
          <div className="flex rounded-lg border border-card-border bg-white">
            <button
              onClick={() => setYearToggle("2027")}
              className={`px-3 py-1.5 text-xs font-medium ${
                yearToggle === "2027"
                  ? "rounded-l-lg bg-purple-accent text-white"
                  : "text-text-secondary"
              }`}
            >
              UPSC 2027 (Mar 2026 – Mar 2027)
            </button>
            <button
              onClick={() => setYearToggle("2026")}
              className={`px-3 py-1.5 text-xs font-medium ${
                yearToggle === "2026"
                  ? "rounded-r-lg bg-purple-accent text-white"
                  : "text-text-secondary"
              }`}
            >
              UPSC 2026 (Mar 2025 – Mar 2026)
            </button>
          </div>
        </div>

        {/* Intelligence Brief */}
        <div className="mt-6 rounded-xl border-t-4 border-purple-accent bg-purple-50/40 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-text-primary">
              Intelligence Brief
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveBrief("latest")}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  activeBrief === "latest"
                    ? "bg-navbar-bg text-white"
                    : "bg-white text-text-secondary"
                }`}
              >
                Latest 18
              </button>
              <button
                onClick={() => setActiveBrief("week")}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  activeBrief === "week"
                    ? "bg-navbar-bg text-white"
                    : "bg-white text-text-secondary"
                }`}
              >
                This Week 88
              </button>
            </div>
          </div>

          {/* Sub-bar */}
          <div className="mb-4 flex items-center gap-3 rounded-lg bg-navbar-bg px-4 py-2 text-xs text-gray-300">
            <span className="font-bold text-white">LATEST</span>
            <span>Sep 3</span>
            <span>≡ 18 items</span>
            <span className="ml-auto">⚡ 7 must-know</span>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Must-know */}
            <div className="rounded-lg border-l-4 border-danger-red bg-white p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-danger-red">
                Must-Know
              </p>
              <div className="space-y-3">
                {[
                  { tag: "SCIENCE & TECHNOLOGY", h: "ISRO Countdown for GSLV-F17/EOS-05 Mission" },
                  { tag: "SCHEMES & PROGRAMS", h: "PM Formalisation of Micro Food Processing Enterprises — Phase II" },
                  { tag: "ENVIRONMENT & ECOLOGY", h: "India's Updated NDC Under Paris Agreement Submitted" },
                ].map((r, i) => (
                  <div key={i} className="border-b border-card-border pb-2 last:border-b-0 last:pb-0">
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-text-muted">
                      {r.tag}
                    </span>
                    <p className="mt-1 text-xs font-medium text-text-primary">
                      {r.h}
                    </p>
                  </div>
                ))}
              </div>
              <button className="mt-2 text-xs font-medium text-primary-blue hover:underline">
                +4 more
              </button>
            </div>

            {/* Updated */}
            <div className="rounded-lg border-l-4 border-primary-blue bg-white p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-primary-blue">
                Updated
              </p>
              <div className="space-y-3">
                {[
                  { tag: "ARC", tagC: "bg-warning-bg text-warning-amber", h: "2nd ARC recommendations on police reforms — implementation status", delta: "+2" },
                  { tag: "THEME", tagC: "bg-blue-50 text-primary-blue", h: "Critical minerals supply chain — new bilateral agreements", delta: "+1" },
                  { tag: "THEME", tagC: "bg-blue-50 text-primary-blue", h: "Urban flooding — NGT directives to state governments", delta: "+2" },
                ].map((r, i) => (
                  <div key={i} className="flex items-start gap-2 border-b border-card-border pb-2 last:border-b-0 last:pb-0">
                    <div className="flex-1">
                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${r.tagC}`}>
                        {r.tag}
                      </span>
                      <p className="mt-1 text-xs font-medium text-text-primary">
                        {r.h}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-success-bg px-1.5 py-0.5 text-[10px] font-bold text-success-green">
                      {r.delta}
                    </span>
                  </div>
                ))}
              </div>
              <button className="mt-2 text-xs font-medium text-primary-blue hover:underline">
                +2 more
              </button>
            </div>
          </div>
        </div>

        {/* Tabs + filter */}
        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <Tabs tabs={tabs} activeIndex={activeTab} onChange={setActiveTab} />

          {/* Mini filter */}
          <div className="rounded-lg border border-card-border bg-white px-3 py-2">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
              GS Paper
            </p>
            <div className="flex flex-col gap-1 text-xs text-text-secondary">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="h-3 w-3 rounded accent-primary-blue" />
                All
              </label>
              {["GS-1", "GS-2", "GS-3", "GS-4"].map((g, i) => (
                <label key={i} className="flex items-center gap-2">
                  <input type="checkbox" className="h-3 w-3 rounded accent-primary-blue" />
                  {g}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Theme cards grid */}
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {themeCards.map((card, i) => (
            <div
              key={i}
              className="rounded-xl border border-card-border bg-white p-4"
            >
              <h3 className="text-sm font-bold leading-snug text-text-primary">
                {card.title}
              </h3>
              <div className="mt-2 flex flex-wrap gap-1">
                {card.tags.map((t, j) => (
                  <Badge key={j} variant="blue">
                    {t}
                  </Badge>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-text-muted">
                {card.threads} threads · {card.news} news items · {card.pyqs}{" "}
                PYQs · ✓ Refreshed
              </p>
              <ul className="mt-3 space-y-1.5">
                {card.findings.map((f, j) => (
                  <li key={j} className="flex items-start gap-1.5 text-xs text-text-secondary">
                    <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-primary-blue" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button className="mt-3 text-xs font-medium text-primary-blue hover:underline">
                View Theme →
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
