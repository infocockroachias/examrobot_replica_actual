"use client";

interface Tab {
  label: string;
  count?: number | string;
}

interface TabsProps {
  tabs: Tab[];
  activeIndex: number;
  onChange: (index: number) => void;
}

export default function Tabs({ tabs, activeIndex, onChange }: TabsProps) {
  return (
    <div className="flex flex-wrap gap-0 border-b border-card-border">
      {tabs.map((tab, i) => {
        const active = i === activeIndex;
        return (
          <button
            key={i}
            onClick={() => onChange(i)}
            className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "text-indigo-accent"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            <span className="flex items-center gap-1.5">
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    active
                      ? "bg-indigo-accent/10 text-indigo-accent"
                      : "bg-gray-100 text-text-muted"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </span>
            {active && (
              <span className="absolute bottom-0 left-0 h-0.5 w-full bg-indigo-accent" />
            )}
          </button>
        );
      })}
    </div>
  );
}
