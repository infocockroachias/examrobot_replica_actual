"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { AccentButton } from "./Buttons";

interface AccordionRowProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle?: string; // monospace subtitle
  quote: string;
  body: string;
  bullets: string[];
  tagline: string;
  buttonLabel: string;
  buttonVariant?: "primary" | "teal" | "outline" | "dark";
  buttonHref?: string;
  buttonPrefetch?: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

export default function AccordionRow({
  icon,
  iconBg,
  title,
  subtitle,
  quote,
  body,
  bullets,
  tagline,
  buttonLabel,
  buttonVariant = "primary",
  buttonHref,
  buttonPrefetch,
  isOpen,
  onToggle,
}: AccordionRowProps) {
  return (
    <div
      className={`overflow-hidden rounded-xl border transition-all ${
        isOpen
          ? "border-text-primary bg-navbar-bg text-white"
          : "border-card-border bg-white hover:border-gray-300"
      }`}
    >
      {/* Red left accent bar when active */}
      {isOpen && <div className="h-1 w-full bg-primary-blue" />}

      {/* Header */}
      <button
        onClick={onToggle}
        className="flex w-full items-start gap-4 px-5 py-4 text-left"
      >
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            isOpen ? "bg-primary-blue text-white" : iconBg
          }`}
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3
              className={`text-base font-bold ${
                isOpen ? "text-white" : "text-text-primary"
              }`}
            >
              {title}
            </h3>
            {isOpen ? (
              <ChevronUp className="h-5 w-5 shrink-0 text-primary-blue" />
            ) : (
              <ChevronDown className="h-5 w-5 shrink-0 text-text-muted" />
            )}
          </div>
          {subtitle && (
            <p
              className={`micro-label mt-0.5 ${
                isOpen ? "text-white/50" : "text-text-muted"
              }`}
            >
              {subtitle}
            </p>
          )}
          <p
            className={`mt-1 text-sm italic ${
              isOpen ? "text-white/60" : "text-text-muted"
            }`}
          >
            {quote}
          </p>
        </div>
      </button>

      {/* Expanded body */}
      {isOpen && (
        <div className="border-t border-white/10 px-5 pb-5 pt-4">
          <p className="text-sm text-white/70">{body}</p>
          <ul className="mt-3 space-y-2">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 shrink-0 text-primary-blue">›</span>
                <span
                  className="text-white/70"
                  dangerouslySetInnerHTML={{ __html: b }}
                />
              </li>
            ))}
          </ul>
          <div className="my-4 h-px w-full bg-white/10" />
          <p className="mb-4 text-xs italic text-white/40">{tagline}</p>
          <AccentButton
            variant={buttonVariant}
            href={buttonHref}
            prefetch={buttonPrefetch}
          >
            {buttonLabel}
          </AccentButton>
        </div>
      )}
    </div>
  );
}
