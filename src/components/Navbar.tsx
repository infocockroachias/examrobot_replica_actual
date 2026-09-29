"use client";

import Link from "next/link";
import { ChevronDown, LogOut, User, Menu, LayoutDashboard, FileText } from "lucide-react";
import { Logo } from "@/components/Logo";

export type NavbarAuthState = "logged-out" | "logged-in";

interface NavbarProps {
  authState?: NavbarAuthState;
  username?: string;
  variant?: "public" | "app";
}

export default function Navbar({
  authState = "logged-out",
  username = "Aspirant",
  variant = "public",
}: NavbarProps) {
  const isLoggedIn = authState === "logged-in";

  return (
    <nav className="w-full bg-navbar-bg text-white">
      <div className="mx-auto flex h-16 max-w-[1300px] items-center justify-between px-6">
        {/* Logo: mark + wordmark + mono subtitle */}
        <Link href="/" className="flex items-center gap-3">
          <Logo className="h-9 w-9" />
          <span className="flex flex-col leading-none">
            <span className="text-[15px] font-bold tracking-wide">
              APPROACHES
            </span>
            <span className="micro-label mt-0.5 text-[9px] text-white/50">
              to IAS
            </span>
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3 text-sm">
          {isLoggedIn && (
            <span className="hidden text-sm text-white/60 sm:inline">
              Hello,{" "}
              <span className="font-semibold text-white">{username}</span>
            </span>
          )}

          {/* Unified black pill nav — one parent, two inner buttons.
              Active page = bg-neutral-808 inner; inactive = transparent. */}
          <div className="hidden items-center rounded-full bg-black p-1 md:flex">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-full px-4 py-2 text-white"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </Link>
            <Link
              href="/test-series"
              className="flex items-center gap-2 rounded-full bg-neutral-800 px-4 py-2 text-white"
            >
              <FileText className="h-3.5 w-3.5" />
              Test Series
            </Link>
          </div>

          {/* Secondary nav links with icons */}
          <Link
            href="/writing-lab"
            className="hidden items-center gap-1.5 text-sm text-white/70 hover:text-white lg:flex"
          >
            Writing Lab
          </Link>
          <Link
            href="/carta"
            className="hidden items-center gap-1.5 text-sm text-white/70 hover:text-white lg:flex"
          >
            CARTA
          </Link>

          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="hidden items-center gap-1 text-sm text-white/60 hover:text-white sm:flex"
              >
                <User className="h-3.5 w-3.5" />
                Account
              </Link>
              <Link
                href="/"
                className="flex items-center gap-1 text-sm text-white/60 hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" />
                Log out
              </Link>
            </>
          ) : (
            <Link
              href="/dashboard"
              className="btn-pill bg-primary-blue px-5 py-2 text-sm font-semibold text-white hover:bg-primary-blue-dark"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu placeholder */}
      <div className="flex border-t border-white/10 px-4 py-2 md:hidden">
        <button className="flex items-center gap-2 text-sm text-white/70">
          <Menu className="h-4 w-4" />
          Menu
        </button>
      </div>
    </nav>
  );
}
