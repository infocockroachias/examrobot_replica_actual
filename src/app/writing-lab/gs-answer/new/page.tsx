"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Stepper from "@/components/Stepper";
import { Badge } from "@/components/Badge";

const steps = [
  { label: "Question Details" },
  { label: "Your Answer" },
  { label: "Review & Submit" },
];

export default function GSAnswerWizardPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [method, setMethod] = useState<"text" | "pdf" | "images" | "photo">("text");
  const [activePaper, setActivePaper] = useState(0);

  return (
    <main className="min-h-screen bg-page-bg">
      <Navbar authState="logged-in" username="Aspirant" variant="app" />

      <div className="mx-auto max-w-[1200px] px-6 py-8">
        <h1 className="mb-6 text-2xl font-bold text-text-primary">
          GS Answer Evaluation
        </h1>

        <div className="mb-8">
          <Stepper steps={steps} currentStep={currentStep} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Left — main form */}
          <div className="space-y-5">
            {/* Question Details */}
            <div className="rounded-xl border border-card-border bg-white p-5">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-text-muted">
                Question Details
              </h2>
              <label className="mb-1 block text-sm font-medium text-text-primary">
                Question *
              </label>
              <textarea
                rows={3}
                placeholder="Enter the question you are answering..."
                className="w-full rounded-lg border border-card-border px-3 py-2 text-sm outline-none focus:border-primary-blue focus:ring-1 focus:ring-primary-blue"
              />
              <p className="mt-1 text-xs text-text-muted">
                Enter the GS question you are answering
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-primary">
                    Paper Type *
                  </label>
                  <select className="w-full rounded-lg border border-card-border px-3 py-2 text-sm outline-none">
                    <option>Select Paper Type</option>
                    <option>GS1</option>
                    <option>GS2</option>
                    <option>GS3</option>
                    <option>GS4</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-primary">
                    Word Limit
                  </label>
                  <select className="w-full rounded-lg border border-card-border px-3 py-2 text-sm outline-none">
                    <option>250 words (15 marks)</option>
                    <option>150 words (10 marks)</option>
                    <option>300 words (20 marks)</option>
                  </select>
                </div>
              </div>

              {/* Before you submit */}
              <div className="mt-4 rounded-lg border border-success-green/30 bg-success-bg/40 p-4">
                <p className="mb-2 flex items-center gap-2 text-sm font-bold text-success-green">
                  📍 Before You Submit
                </p>
                <ul className="space-y-1.5 text-sm text-text-secondary">
                  <li>
                    <strong className="text-text-primary">One answer per submission</strong> — stick to the word limit (150/250/300 words)
                  </li>
                  <li>
                    <strong className="text-text-primary">Handwritten?</strong> Keep it legible, minimize pages for accurate OCR
                  </li>
                  <li>
                    <strong className="text-text-primary">Not sure what to expect?</strong> Try a sample demo on the right panel first
                  </li>
                  <li>
                    This is deep UPSC-style analysis — submit when you've written a serious attempt
                  </li>
                  <li>
                    Evaluation covers content, structure, factual accuracy & model answer hints
                  </li>
                </ul>
              </div>
            </div>

            {/* Your Answer */}
            <div className="rounded-xl border border-card-border bg-white p-5">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-text-muted">
                Your Answer
              </h2>
              <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
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
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-text-primary">
                  Your Answer *
                </label>
                <span className="text-xs text-text-muted">0 words</span>
              </div>
              <textarea
                rows={8}
                placeholder="Type or paste your answer here..."
                className="w-full rounded-lg border border-card-border px-3 py-2 text-sm outline-none focus:border-primary-blue focus:ring-1 focus:ring-primary-blue"
              />
            </div>

            {/* Ready to Submit */}
            <div className="rounded-xl border border-card-border bg-white p-5">
              <h2 className="mb-4 text-sm font-bold text-text-primary">
                Ready to Submit
              </h2>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="text-sm text-text-secondary">
                  <p>
                    Question: <span className="font-medium text-text-primary">—</span>
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
                  <button className="mt-2 rounded-lg bg-gradient-to-r from-info-teal to-primary-blue px-5 py-2 text-sm font-semibold text-white">
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
            {/* My Submissions */}
            <div className="rounded-xl border border-card-border bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-text-primary">
                🕐 My Submissions
              </h3>
              <p className="mb-3 text-sm text-text-secondary">
                View past evaluations
              </p>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-sm text-text-secondary">
                  ⌛ 3 of 3 left
                </span>
                <Badge variant="purple">Trial</Badge>
              </div>
            </div>

            {/* Try a sample */}
            <div className="rounded-xl border border-card-border bg-green-50/40 p-5">
              <h3 className="mb-3 text-sm font-bold text-text-primary">
                ▷ Try a Sample First
              </h3>
              <div className="mb-3 flex gap-1.5">
                {["GS1", "GS2", "GS3", "GS4"].map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePaper(i)}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      activePaper === i
                        ? "bg-primary-blue text-white"
                        : "bg-white text-text-secondary"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <Badge variant="teal" className="mb-2">
                GS1 - Art & Culture
              </Badge>
              <p className="text-sm font-semibold text-text-primary">
                "Cave paintings are the window into the aesthetic sensitivity and
                creativity of ancient humans." Discuss the statement with
                reference to ancient Indian cave paintings. (10 marks, 150
                words)
              </p>
              <div className="mt-3 flex items-center justify-between rounded-lg bg-white px-3 py-2">
                <div>
                  <p className="text-xs font-medium text-text-primary">
                    📄 Student Answer (PDF)
                  </p>
                  <p className="text-[10px] text-text-muted">
                    User-written answer for evaluation
                  </p>
                </div>
                <button className="rounded border border-card-border px-2 py-1 text-[10px] font-medium text-text-secondary hover:bg-gray-50">
                  👁 View
                </button>
              </div>
              <button className="mt-3 w-full rounded-lg bg-gradient-to-r from-success-green to-info-teal py-2.5 text-sm font-semibold text-white">
                ▶ Run Demo Evaluation
              </button>
              <p className="mt-1 text-center text-[10px] text-text-muted">
                ~20 seconds demo
              </p>
            </div>

            {/* What gets analyzed */}
            <div className="rounded-xl border border-card-border bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-text-primary">
                ⊕ What Gets Analyzed
              </h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>
                  <strong className="text-text-primary">Directive compliance</strong> — did you do what was asked?
                </li>
                <li>
                  <strong className="text-text-primary">Gap analysis</strong> — points you missed, angles unexplored
                </li>
                <li>
                  <strong className="text-text-primary">Fact verification</strong> — dates, stats, provisions checked
                </li>
                <li>
                  <strong className="text-text-primary">Current affairs</strong> — outdated data flagged via live search
                </li>
                <li>
                  <strong className="text-text-primary">Framework coverage</strong> — PESTEL, stakeholder dimensions
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
