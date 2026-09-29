"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface FilterOption {
  label: string;
  count: number;
}

interface FilterGroup {
  name: string;
  options: FilterOption[];
}

interface FilterSidebarProps {
  groups: FilterGroup[];
  showReset?: boolean;
  onReset?: () => void;
  selected?: string[];
  onChange?: (selected: string[]) => void;
}

function FilterGroupRow({
  group,
  defaultOpen = true,
  selected,
  onToggle,
}: {
  group: FilterGroup;
  defaultOpen?: boolean;
  selected: string[];
  onToggle: (label: string) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-card-border py-4 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-sm font-bold text-text-primary"
      >
        {group.name}
        {open ? (
          <ChevronUp className="h-4 w-4 text-text-muted" />
        ) : (
          <ChevronDown className="h-4 w-4 text-text-muted" />
        )}
      </button>
      {open && (
        <div className="mt-3 space-y-2">
          {group.options.map((opt, i) => (
            <label
              key={i}
              className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt.label)}
                onChange={() => onToggle(opt.label)}
                className="h-3.5 w-3.5 rounded border-gray-300 accent-primary-blue"
              />
              <span className="flex-1">{opt.label}</span>
              <span className="text-xs text-text-muted">({opt.count})</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FilterSidebar({
  groups,
  showReset = false,
  onReset,
  selected = [],
  onChange,
}: FilterSidebarProps) {
  const handleToggle = (label: string) => {
    if (!onChange) return;
    if (selected.includes(label)) {
      onChange(selected.filter((s) => s !== label));
    } else {
      onChange([...selected, label]);
    }
  };

  return (
    <aside className="rounded-xl border border-card-border bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-bold uppercase tracking-wide text-text-primary">
          Filters
        </span>
        {showReset && (
          <button
            onClick={onReset}
            className="text-xs font-medium text-primary-blue hover:underline"
          >
            Reset
          </button>
        )}
      </div>
      {groups.map((g, i) => (
        <FilterGroupRow
          key={i}
          group={g}
          selected={selected}
          onToggle={handleToggle}
        />
      ))}
    </aside>
  );
}
