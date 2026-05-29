"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, Moon, Sun, X } from "lucide-react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing",  href: "#pricing"  },
  { label: "FAQ",      href: "#faq"      },
];

export function MarketingNavbar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [theme,       setTheme]       = useState<"light" | "dark">("light");

  // Sync scroll
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Read persisted theme on mount
  useEffect(() => {
    const saved = localStorage.getItem("carimail-theme") as "light" | "dark" | null;
    const initial = saved ?? "light";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (!href.startsWith("#")) return;
    e.preventDefault();
    setMobileOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  }

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("carimail-theme", next);
  }

  const navBg = scrolled
    ? theme === "dark"
      ? "rgba(15,17,23,0.92)"
      : "rgba(245,247,251,0.93)"
    : "transparent";

  return (
    <>
      <header
        className="fixed left-0 right-0 top-0 z-50 transition-all duration-300"
        style={{
          background: navBg,
          backdropFilter: scrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid var(--cm-border)" : "1px solid transparent",
          boxShadow: scrolled ? "0 1px 20px rgba(15,23,42,0.06)" : "none",
        }}
      >
        <div className="mx-auto flex h-[66px] max-w-6xl items-center justify-between px-5 sm:px-8">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border transition duration-200 group-hover:scale-105"
              style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)", boxShadow: "var(--cm-shadow)" }}
            >
              <Image src="/logo.webp" alt="Carimail" width={22} height={22} className="object-contain" priority />
            </div>
            <div>
              <div className="text-[15px] font-[800] tracking-tight" style={{ color: "var(--cm-text)" }}>Carimail</div>
              <div className="text-[9.5px] leading-none" style={{ color: "var(--cm-text3)" }}>by Hostcari</div>
            </div>
          </Link>

          {/* Desktop center nav */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={e => handleNavClick(e, link.href)}
                className="rounded-xl px-4 py-2 text-[13.5px] font-[600] transition hover:opacity-70"
                style={{ color: "var(--cm-text2)" }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop right */}
          <div className="hidden items-center gap-2 md:flex">
            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 hover:scale-105"
              style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)", color: "var(--cm-text2)", boxShadow: "var(--cm-shadow)" }}
            >
              {theme === "dark"
                ? <Sun  className="h-4 w-4" />
                : <Moon className="h-4 w-4" />}
            </button>

            <Link
              href="/sign-in"
              className="rounded-xl px-4 py-2 text-[13px] font-[700] transition hover:opacity-70"
              style={{ color: "var(--cm-text2)" }}
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="group relative overflow-hidden rounded-xl px-4 py-2.5 text-[13px] font-[800] text-white transition hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, var(--cm-accent), var(--cm-accent2))", boxShadow: "0 4px 14px var(--cm-accent-b)" }}
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              Get started free
            </Link>
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="flex h-9 w-9 items-center justify-center rounded-xl border transition"
              style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)", color: "var(--cm-text2)" }}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Toggle navigation"
              className="flex h-9 w-9 items-center justify-center rounded-xl border transition"
              style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)", color: "var(--cm-text2)" }}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile menu panel */}
      <div
        className="fixed left-0 right-0 top-[66px] z-40 overflow-hidden transition-all duration-300 md:hidden"
        style={{
          maxHeight: mobileOpen ? "400px" : "0",
          background: "var(--cm-surface)",
          borderBottom: mobileOpen ? "1px solid var(--cm-border)" : "none",
          boxShadow: mobileOpen ? "0 12px 40px rgba(15,23,42,0.12)" : "none",
        }}
      >
        <div className="space-y-0.5 px-4 pb-5 pt-3">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={e => handleNavClick(e, link.href)}
              className="flex items-center rounded-xl px-4 py-3 text-[14px] font-[600] transition"
              style={{ color: "var(--cm-text2)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--cm-surface2)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 border-t pt-3" style={{ borderColor: "var(--cm-border)" }}>
            <Link
              href="/sign-in"
              onClick={() => setMobileOpen(false)}
              className="block rounded-xl border px-4 py-3 text-center text-[14px] font-[700] transition"
              style={{ borderColor: "var(--cm-border2)", color: "var(--cm-text2)" }}
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              onClick={() => setMobileOpen(false)}
              className="block rounded-xl px-4 py-3 text-center text-[14px] font-[800] text-white transition"
              style={{ background: "linear-gradient(135deg, var(--cm-accent), var(--cm-accent2))", boxShadow: "0 4px 14px var(--cm-accent-b)" }}
            >
              Get started free →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
