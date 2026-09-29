import React from "react";

export function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 200 40 C 208 40 215 44 219 52 L 370 330 C 378 345 368 365 350 365 L 50 365 C 32 365 22 345 30 330 L 181 52 C 185 44 192 40 200 40 Z"
        fill="#E60000"
      />
      <circle cx="200" cy="185" r="42" fill="#FFFFFF" />
      <path
        d="M 163 365 L 163 290 C 163 269 180 252 200 252 C 220 252 237 269 237 290 L 237 365 Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}
