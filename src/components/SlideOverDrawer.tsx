"use client";

import { X } from "lucide-react";

interface SlideOverDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  width?: string;
}

export default function SlideOverDrawer({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
  width = "w-[480px]",
}: SlideOverDrawerProps) {
  if (!open) return null;
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 transition-opacity"
        onClick={onClose}
      />
      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 z-50 flex h-full ${width} flex-col border-l border-card-border bg-white shadow-xl`}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-card-border px-5 py-4">
          <div className="flex items-start gap-2">
            {icon && (
              <span className="mt-0.5 text-text-secondary">{icon}</span>
            )}
            <div>
              <h3 className="text-base font-bold text-text-primary">{title}</h3>
              {subtitle && (
                <p className="mt-0.5 text-xs text-text-muted">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-text-muted hover:bg-gray-100 hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* Body */}
        <div className="thin-scroll flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>
      </div>
    </>
  );
}
