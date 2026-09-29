"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Stepper from "@/components/Stepper";
import { Badge } from "@/components/Badge";
import { CheckCircle2 } from "lucide-react";

const steps = [
  { label: "Essay Details" },
  { label: "Upload Content" },
  { label: "Review & Submit" },
];

export default function EssayWizardPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [method, setMethod] = useState<"text" | "pdf" | "images" | "photo">("text");
  const [activeSample, setActiveSample] = useState(0);

  return (
    <main className="min-h-screen bg-page-bg">
      <Navbar authState="logged-in" username="Aspirant" variant="app" />

      <div className="mx-auto max-w-[1200px] px-6 py-8">
        <h1 className="mb-6 text-2xl font-bold text-text-primary">
          Essay Evaluation
        </h1>

        <div className="mb-8">
          <Stepper steps={steps} currentStep={currentStep} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Left — main form */}
          <div className="space-y-5">
            {/* Essay Details card */}
            <div className="rounded-xl border border-card-border bg-white p-5">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-text-muted">
                Essay Details
              </h2>
              <label className="mb-1 block text-sm font-medium text-text-primary">
                Essay Title *
              </label>
              <input
                type="text"
                placeholder="Enter essay title"
                className="w-full rounded-lg border border-card-border px-3 py-2 text-sm outline-none focus:border-primary-blue focus:ring-1 focus:ring-primary-blue"
              />

              {/* Before you submit callout */}
              <div className="mt-4 rounded-lg border border-primary-blue/30 bg-blue-50/50 p-4">
                <p className="mb-2 flex items-center gap-2 text-sm font-bold text-primary-blue">
                  📍 Before You Submit
                </p>
                <ul className="space-y-1.5 text-sm text-text-secondary">
                  <li>
                    <strong className="text-text-primary">One essay per submission</strong> — word limit 1000-1200 words recommended
                  </li>
                  <li>
                    <strong className="text-text-primary">Handwritten?</strong> Keep it legible and pages minimal for best OCR results
                  </li>
                  <li>
                    <strong className="text-text-primary">Serious submissions only</strong> — this deep, multi-dimensional analysis takes effort to consume
                  </li>
                  <li>
                    This evaluation teaches writing mastery across multiple facets — submit when you're ready to learn
                  </li>
                </ul>
              </div>
            </div>

            {/* Submission method */}
            <div className="rounded-xl border border-card-border bg-white p-5">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-text-muted">
                Choose Submission Method
              </h2>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {[
                  { id: "text" as const, icon: "⌨", label: "Text" },
                  { id: "pdf" as const, icon: "📄", label: "Upload PDF" },
                  { id: "images" as const, icon: "🖼", label: "Upload Images" },
                  { id: "photo" as const, icon: "📷", label: "Take Photo" },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-sm font-medium transition-colors ${
                      method === m.id
                        ? "border-primary-blue bg-blue-50 text-primary-blue"
                        : "border-card-border text-text-secondary hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-lg">{m.icon}</span>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Essay content */}
            <div className="rounded-xl border border-card-border bg-white p-5">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-text-primary">
                  Essay Content *
                </label>
                <span className="text-xs text-text-muted">0 words</span>
              </div>
              <textarea
                rows={10}
                placeholder="Paste or type your essay here..."
                className="w-full rounded-lg border border-card-border px-3 py-2 text-sm outline-none focus:border-primary-blue focus:ring-1 focus:ring-primary-blue"
              />
              <p className="mt-2 text-xs text-text-muted">
                Minimum ~100 words recommended. Use proper formatting and
                structure.
              </p>
            </div>

            {/* Ready to Submit (last step preview) */}
            <div className="rounded-xl border border-card-border bg-white p-5">
              <h2 className="mb-4 text-sm font-bold text-text-primary">
                Ready to Submit
              </h2>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="text-sm text-text-secondary">
                  <p>
                    Essay: <span className="font-medium text-text-primary">—</span>
                  </p>
                  <p className="mt-1">
                    Method:{" "}
                    <span className="font-medium text-text-primary">
                      Text Submission
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-muted">Analysis time</p>
                  <p className="text-sm font-bold text-text-primary">2-6 min</p>
                  <button className="mt-2 rounded-lg bg-indigo-accent px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                    Submit & Stream
                  </button>
                </div>
              </div>
              <p className="mt-3 text-xs text-text-muted">
                After submission, track progress at{" "}
                <strong className="text-text-primary">/my-essays</strong>. You'll
                also receive an email when your evaluation is ready.
              </p>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">
            {/* Your Stats */}
            <div className="rounded-xl border border-card-border bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-text-primary">
                📊 Your Stats
              </h3>
              <div className="mb-4 flex flex-col items-center justify-center py-4 text-center">
                <span className="text-2xl">📊</span>
                <p className="mt-2 text-sm text-text-muted">
                  Submit your first essay to see stats
                </p>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-sm text-text-secondary">
                  ⌛ 1 of 1 left
                </span>
                <Badge variant="purple">Trial</Badge>
              </div>
              <button className="mt-3 w-full rounded-lg border border-card-border py-2 text-xs font-medium text-text-secondary hover:bg-gray-50">
                ⊙ Upgrade for more
              </button>
            </div>

            {/* Try a sample */}
            <div className="rounded-xl border border-card-border bg-blue-50/40 p-5">
              <h3 className="mb-3 text-sm font-bold text-text-primary">
                ▷ Try a Sample First
              </h3>
              <p className="mb-3 text-xs text-text-muted">
                See how evaluation works before submitting
              </p>
              <div className="mb-3 flex gap-2">
                {["Essay 1", "Essay 2"].map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSample(i)}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      activeSample === i
                        ? "bg-primary-blue text-white"
                        : "bg-white text-text-secondary"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <Badge variant="purple" className="mb-2">
                UPSC Essay
              </Badge>
              <p className="text-sm font-bold text-text-primary">
                Justice must reach the poor
              </p>
              <p className="text-xs italic text-text-muted">
                A sample essay on social justice
              </p>
              <div className="mt-3 flex items-center justify-between rounded-lg bg-white px-3 py-2">
                <div>
                  <p className="text-xs font-medium text-text-primary">
                    📄 Sample Essay (PDF)
                  </p>
                  <p className="text-[10px] text-text-muted">
                    Handwritten, ~1000 words
                  </p>
                </div>
                <button className="rounded border border-card-border px-2 py-1 text-[10px] font-medium text-text-secondary hover:bg-gray-50">
                  👁 View
                </button>
              </div>
              <button className="mt-3 w-full rounded-lg bg-gradient-to-r from-info-teal to-primary-blue py-2.5 text-sm font-semibold text-white">
                ▶ Run Demo Evaluation
              </button>
              <p className="mt-1 text-center text-[10px] text-text-muted">
                ~20 seconds demo • No submission required
              </p>
            </div>

            {/* Writing tips */}
            <div className="rounded-xl border border-card-border bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-text-primary">
                📍 Writing Tips
              </h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>Structure: intro → body → conclusion</li>
                <li>Use specific examples</li>
                <li>Maintain consistent tone</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
