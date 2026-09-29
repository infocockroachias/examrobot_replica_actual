export type BadgeVariant =
  | "neutral"
  | "red"
  | "brand"
  | "blue"
  | "green"
  | "purple"
  | "teal"
  | "dark"
  | "amber"
  | "gray";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-gray-100 text-text-secondary",
  red: "bg-danger-bg text-danger-red",
  brand: "bg-primary-blue text-white",
  blue: "bg-danger-bg text-primary-blue",
  green: "bg-success-bg text-success-green",
  purple: "bg-purple-50 text-purple-accent",
  teal: "bg-teal-50 text-info-teal",
  dark: "bg-navbar-bg text-white",
  amber: "bg-warning-bg text-warning-amber",
  gray: "bg-gray-100 text-text-muted",
};

export function Badge({
  children,
  variant = "neutral",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function Pill({
  children,
  variant = "neutral",
  className = "",
}: BadgeProps) {
  return (
    <Badge
      variant={variant}
      className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider ${className}`}
    >
      {children}
    </Badge>
  );
}
