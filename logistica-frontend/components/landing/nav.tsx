"use client";

import { useState } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";

const links = [
  { label: "Features", href: "#features" },
  { label: "Cómo funciona", href: "#how-it-works" },
  { label: "Testimonios", href: "#testimonials" },
];

export function Nav({
  dark,
  onToggleTheme,
}: {
  dark: boolean;
  onToggleTheme: () => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-6xl glass rounded-2xl px-6 py-3">
      <div className="flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center">
            <span className="text-white font-bold text-sm">LW</span>
          </div>
          <span
            className="font-semibold text-lg hidden sm:block"
            style={{
              color: "var(--color-design-text)",
              fontFamily: "var(--font-lexend)",
            }}
          >
            Logistica Web
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium transition-colors duration-200 cursor-pointer"
              style={{ color: "var(--color-design-text)" }}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleTheme}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer"
            style={{
              color: "var(--color-design-text)",
              background: "var(--color-design-card)",
              border: "1px solid var(--color-design-card-border)",
            }}
            aria-label={dark ? "Modo claro" : "Modo oscuro"}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <a
            href="#cta"
            className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 cursor-pointer hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: "var(--color-design-cta)" }}
          >
            Solicitar demo
          </a>

          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden p-2 cursor-pointer"
            style={{ color: "var(--color-design-text)" }}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? "max-h-64 opacity-100 pt-4 pb-2" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-4">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium transition-colors cursor-pointer"
              style={{ color: "var(--color-design-text)" }}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#cta"
            onClick={() => setMobileOpen(false)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 cursor-pointer"
            style={{ background: "var(--color-design-cta)" }}
          >
            Solicitar demo
          </a>
        </div>
      </div>
    </nav>
  );
}
