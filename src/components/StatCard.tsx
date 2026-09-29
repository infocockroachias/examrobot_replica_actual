interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  sublabel?: string;
  progress?: number;
  progressColor?: string;
}

export default function StatCard({
  icon,
  value,
  label,
  sublabel,
  progress,
  progressColor = "bg-primary-blue",
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-card-border bg-white p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-2xl font-bold text-text-primary">{value}</div>
          <div className="text-sm font-medium text-text-primary">{label}</div>
          {sublabel && (
            <div className="mt-1 text-xs text-text-muted">{sublabel}</div>
          )}
          {progress !== undefined && (
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full ${progressColor}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
