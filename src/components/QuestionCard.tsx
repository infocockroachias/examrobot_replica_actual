"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "./Badge";

interface CardOption {
  label: string; // A, B, C, D
  text: string;
  is_correct?: boolean;
}

interface QuestionCardProps {
  id?: number;
  exam: string;
  year: number;
  questionNumber: number;
  subject?: string;
  subjectBreadcrumb?: string;
  officialKey?: boolean;
  stem: string;
  statements?: { label: string; text: string }[];
  prompt?: string;
  options: CardOption[];
  showAnalyzeLink?: boolean;
  onCardClick?: () => void;
}

export default function QuestionCard({
  id,
  exam,
  year,
  questionNumber,
  subject,
  subjectBreadcrumb,
  officialKey = true,
  stem,
  statements,
  prompt,
  options,
  showAnalyzeLink = true,
  onCardClick,
}: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const answered = selectedOption !== null;

  return (
    <div
      className={`relative rounded-xl border border-card-border bg-white p-5 ${
        onCardClick ? "cursor-pointer transition-colors hover:border-primary-blue/40 hover:bg-primary-blue/[0.02]" : ""
      }`}
      onClick={onCardClick}
    >
      {/* Response Saved — top-right corner, after answering */}
      {answered && (
        <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-success-bg px-2.5 py-1 text-xs font-medium text-success-green">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Response Saved
        </span>
      )}

      {/* Top pills */}
      <div className="mb-3 flex flex-wrap items-center gap-2 pr-28">
        <Badge variant="blue">
          {exam} · {year} · Q{questionNumber}
        </Badge>
        {subjectBreadcrumb && (
          <span className="flex items-center gap-1 text-xs text-text-muted">
            {subject} <span className="text-text-muted">›</span>{" "}
            {subjectBreadcrumb}
          </span>
        )}
        {officialKey && (
          <Badge variant="green">✓ Official Key</Badge>
        )}
      </div>

      {/* Stem */}
      <p className="text-sm font-semibold text-text-primary">{stem}</p>

      {/* Statements */}
      {statements && (
        <div className="mt-3 space-y-2">
          {statements.map((s, i) => (
            <p key={i} className="text-sm text-text-primary">
              <span className="font-semibold">{s.label}</span> {s.text}
            </p>
          ))}
        </div>
      )}

      {/* Prompt */}
      {prompt && (
        <p className="mt-3 text-sm font-semibold text-text-primary">
          {prompt}
        </p>
      )}

      {/* Options */}
      <div className="mt-4 space-y-2">
        {options.map((opt) => {
          const isSelected = selectedOption === opt.label;
          const showCorrect = answered && Boolean(opt.is_correct);
          const showWrong = answered && isSelected && !opt.is_correct;

          return (
            <button
              key={opt.label}
              onClick={(e) => {
                e.stopPropagation();
                if (!answered) setSelectedOption(opt.label);
              }}
              disabled={answered}
              className={`flex w-full items-center gap-3 rounded-lg border px-4 py-2.5 text-sm text-left ${
                showCorrect
                  ? "border-success-green/40 bg-success-bg"
                  : showWrong
                    ? "border-danger-red/40 bg-danger-bg"
                    : isSelected
                      ? "border-primary-blue/40 bg-primary-blue/5"
                      : "border-card-border hover:border-primary-blue/30"
              } ${answered ? "cursor-default" : "cursor-pointer"}`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  showCorrect
                    ? "bg-success-green text-white"
                    : showWrong
                      ? "bg-danger-red text-white"
                      : "border border-card-border text-text-secondary"
                }`}
              >
                {opt.label}
              </span>
              <span className="text-text-primary">{opt.text}</span>
              {showCorrect && (
                <CheckCircle2 className="ml-auto h-4 w-4 text-success-green" />
              )}
              {showWrong && (
                <XCircle className="ml-auto h-4 w-4 text-danger-red" />
              )}
            </button>
          );
        })}
      </div>

      {/* Analyze link */}
      {showAnalyzeLink &&
        (id !== undefined ? (
          <Link
            href={`/questions/${id}`}
            onClick={(e) => e.stopPropagation()}
            className="mt-3 inline-block text-sm font-medium text-primary-blue underline hover:text-primary-blue-dark"
          >
            Analyze in detail
          </Link>
        ) : (
          <button
            onClick={(e) => e.stopPropagation()}
            className="mt-3 text-sm font-medium text-primary-blue underline hover:text-primary-blue-dark"
          >
            Analyze in detail
          </button>
        ))}
    </div>
  );
}
