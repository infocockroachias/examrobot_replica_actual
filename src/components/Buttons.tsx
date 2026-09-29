import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface AccentButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: "primary" | "teal" | "outline" | "dark";
  size?: "md" | "lg";
  href?: string;
  icon?: React.ReactNode; // leading icon
  prefetch?: boolean;
}

export function AccentButton({
  children,
  className = "",
  onClick,
  variant = "primary",
  size = "md",
  href,
  icon,
  prefetch,
}: AccentButtonProps) {
  const sizeClass =
    size === "lg" ? "px-8 py-4 text-base" : "px-6 py-3 text-sm";

  const variantClass = {
    primary:
      "bg-primary-blue text-white hover:bg-primary-blue-dark rounded-full",
    teal: "bg-navbar-bg text-white hover:bg-navbar-bg-2 rounded-full",
    outline:
      "bg-white text-text-primary border-2 border-text-primary rounded-full hover:bg-text-primary hover:text-white",
    dark: "bg-text-primary text-white hover:bg-navbar-bg rounded-full",
  }[variant];

  const inner = (
    <>
      {icon}
      {children}
      <ArrowRight className="h-4 w-4" />
    </>
  );

  const classes = `inline-flex items-center justify-center gap-2 font-semibold transition-all ${variantClass} ${sizeClass} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} prefetch={prefetch}>
        {inner}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={classes}>
      {inner}
    </button>
  );
}

interface OutlineButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  href?: string;
}

export function OutlineButton({
  children,
  className = "",
  onClick,
  icon,
  href,
}: OutlineButtonProps) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full border-2 border-text-primary bg-white px-5 py-2.5 text-sm font-semibold text-text-primary hover:bg-text-primary hover:text-white ${className}`;
  const inner = (
    <>
      {icon}
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {inner}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={classes}>
      {inner}
    </button>
  );
}

interface GoogleLoginButtonProps {
  onClick?: () => void;
  href?: string;
}

export function GoogleLoginButton({ onClick, href }: GoogleLoginButtonProps) {
  const classes =
    "inline-flex items-center justify-center gap-2.5 rounded-full border-2 border-card-border bg-white px-5 py-2.5 text-sm font-medium text-text-primary hover:bg-gray-50";
  const inner = (
    <>
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path
          fill="#FFC107"
          d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.3 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z"
        />
        <path
          fill="#FF3D00"
          d="M6.3 14.7l6.6 4.8C14.7 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.3 29 4.5 24 4.5 16.3 4.5 9.6 8.9 6.3 14.7z"
        />
        <path
          fill="#4CAF50"
          d="M24 43.5c5 0 9.5-1.7 13-4.7l-6-5.1c-2 1.4-4.4 2.3-7 2.3-5.3 0-9.7-3.1-11.3-7.4l-6.6 5.1C9.5 39.1 16.2 43.5 24 43.5z"
        />
        <path
          fill="#1976D2"
          d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6 5.1c-.4.4 6.3-4.6 6.3-14.6 0-1.2-.1-2.3-.4-3.5z"
        />
      </svg>
      Login with Google
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {inner}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={classes}>
      {inner}
    </button>
  );
}
