"use client";
import { useEffect, useRef, useState } from "react";

// ─── AES-256 Encrypt ──────────────────────────────────────────────────────────
const HEX = "0123456789abcdef";
const rh = (n: number) => Array.from({ length: n }, () => HEX[Math.floor(Math.random() * 16)]).join("");

export function EncryptAnimation({ paused = false }: { paused?: boolean }) {
  const [rows, setRows] = useState(() => [rh(10), rh(10), rh(10)]);
  const [phase, setPhase] = useState<"plain" | "scrambling" | "locked">("plain");

  useEffect(() => {
    if (paused) { setPhase("plain"); setRows([rh(10), rh(10), rh(10)]); return; }
    let t: ReturnType<typeof setTimeout>;
    let iv: ReturnType<typeof setInterval>;
    const cycle = () => {
      setPhase("plain");
      t = setTimeout(() => {
        setPhase("scrambling");
        let i = 0;
        iv = setInterval(() => {
          setRows([rh(10), rh(10), rh(10)]);
          if (++i >= 7) { clearInterval(iv); setPhase("locked"); t = setTimeout(cycle, 2400); }
        }, 75);
      }, 1600);
    };
    cycle();
    return () => { clearTimeout(t); clearInterval(iv); };
  }, [paused]);

  const locked = phase === "locked";
  return (
    <div className="mt-4 overflow-hidden rounded-xl border"
      style={{ borderColor: locked ? "rgba(16,185,129,0.25)" : "var(--cm-border)", background: "var(--cm-surface2)", transition: "border-color 0.4s" }}>
      <div className="space-y-1.5 px-3 py-2.5">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-3 shrink-0 font-mono text-[9px] tabular-nums" style={{ color: "var(--cm-text3)" }}>0{i}</span>
            <code className="text-[11px] font-mono tracking-widest"
              style={{ color: locked ? "#10B981" : "var(--cm-text2)", transition: "color 0.3s" }}>
              {locked ? "·  ·  ·  ·  ·  ·  ·  ·  ·  ·" : row.split("").join("  ")}
            </code>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 border-t px-3 py-1.5" style={{ borderColor: "var(--cm-border)" }}>
        <div className="h-1.5 w-1.5 rounded-full transition-colors duration-300"
          style={{ background: locked ? "#10B981" : phase === "scrambling" ? "#F97316" : "var(--cm-text3)" }} />
        <span className="text-[10px] font-[600] transition-colors duration-300"
          style={{ color: locked ? "#10B981" : phase === "scrambling" ? "#F97316" : "var(--cm-text3)" }}>
          {locked ? "AES-256 secured" : phase === "scrambling" ? "Encrypting…" : "Raw data"}
        </span>
      </div>
    </div>
  );
}

// ─── Dark / Light Mode ────────────────────────────────────────────────────────
export function ThemeAnimation({ paused = false }: { paused?: boolean }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (paused) { setDark(false); return; }
    const id = setInterval(() => setDark(d => !d), 2600);
    return () => clearInterval(id);
  }, [paused]);

  const bg     = dark ? "#0F172A" : "#F8FAFC";
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)";
  const line   = dark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.09)";
  const textSub = dark ? "#475569" : "#94A3B8";

  return (
    <div className="mt-4 overflow-hidden rounded-xl border"
      style={{ borderColor: border, background: bg, transition: "background 0.7s, border-color 0.7s" }}>
      <div className="flex items-center justify-between border-b px-3 py-2"
        style={{ borderColor: border, transition: "border-color 0.7s" }}>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full transition-colors duration-700" style={{ background: dark ? "#4B9EFF" : "#F97316" }} />
          <div className="h-1.5 w-10 rounded-full" style={{ background: line, transition: "background 0.7s" }} />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[12px]">{dark ? "🌙" : "☀️"}</span>
          <span className="text-[10px] font-[600]" style={{ color: textSub, transition: "color 0.7s" }}>
            {dark ? "Dark" : "Light"}
          </span>
        </div>
      </div>
      <div className="space-y-2 p-3">
        {[68, 82, 50, 74].map((w, i) => (
          <div key={i} className="h-2 rounded-full"
            style={{ width: `${w}%`, background: i === 0 ? line : `${line.slice(0, -2)}0.05)`, transition: "background 0.7s" }} />
        ))}
      </div>
    </div>
  );
}

// ─── Live Search ──────────────────────────────────────────────────────────────
const SEARCH_QUERY = "quarterly rep";
const SEARCH_RESULTS = ["Q3 Report — Finance.pdf", "Quarterly Review Notes"];

export function SearchAnimation({ paused = false }: { paused?: boolean }) {
  const [typed, setTyped] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    if (paused) { setTyped(0); setShowResults(false); return; }
    const run = () => {
      if (!alive.current) return;
      setTyped(0); setShowResults(false);
      let i = 0;
      const next = () => {
        if (!alive.current) return;
        i++; setTyped(i);
        if (i < SEARCH_QUERY.length) setTimeout(next, 90);
        else setTimeout(() => {
          if (!alive.current) return;
          setShowResults(true);
          setTimeout(run, 2600);
        }, 280);
      };
      setTimeout(next, 400);
    };
    run();
    return () => { alive.current = false; };
  }, [paused]);

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center gap-2 rounded-xl border px-3 py-2"
        style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)" }}>
        <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: "var(--cm-text3)" }}>
          <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="m21 21-4.35-4.35"/>
        </svg>
        <span className="font-mono text-[12px]" style={{ color: "var(--cm-text)" }}>
          {SEARCH_QUERY.slice(0, typed)}
          <span style={{ borderRight: "1px solid currentColor", animation: "fcPulse 0.9s ease-in-out infinite", display: "inline-block", width: 1, height: "0.85em", verticalAlign: "middle", marginLeft: 1 }} />
        </span>
      </div>
      {showResults && SEARCH_RESULTS.map((r, i) => (
        <div key={r} className="flex items-center gap-2 rounded-xl px-3 py-2.5"
          style={{ background: "var(--cm-surface2)", opacity: 0, animation: `fcSlideIn 0.28s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s forwards` }}>
          <span className="text-[11px]">📧</span>
          <span className="truncate text-[11.5px] font-[600]" style={{ color: "var(--cm-text2)" }}>{r}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Attachment Viewer ────────────────────────────────────────────────────────
export function AttachmentAnimation({ paused = false }: { paused?: boolean }) {
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (paused) { setPct(0); setDone(false); return; }
    const run = () => {
      setPct(0); setDone(false);
      const iv = setInterval(() => {
        setPct(p => {
          if (p >= 100) { clearInterval(iv); setDone(true); setTimeout(run, 2200); return 100; }
          return p + 4;
        });
      }, 55);
      return () => clearInterval(iv);
    };
    run();
  }, [paused]);

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center gap-3 rounded-xl border px-3 py-2.5"
        style={{ borderColor: done ? "rgba(16,185,129,0.2)" : "var(--cm-border)", background: "var(--cm-surface2)", transition: "border-color 0.4s" }}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-400"
          style={{ background: done ? "rgba(239,68,68,0.10)" : "var(--cm-surface3)" }}>
          <span className="text-[15px]">📄</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="truncate text-[12px] font-[600]" style={{ color: "var(--cm-text)" }}>Q3_Report.pdf</span>
            <span className="ml-2 shrink-0 text-[10px] font-[700]" style={{ color: done ? "#10B981" : "var(--cm-text3)" }}>
              {done ? "Open preview" : `${pct}%`}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--cm-border2)" }}>
            <div className="h-full rounded-full transition-all duration-150"
              style={{ width: `${pct}%`, background: done ? "#10B981" : "var(--cm-accent)" }} />
          </div>
        </div>
      </div>
      {done && (
        <div className="space-y-1.5 overflow-hidden rounded-xl border px-3 py-2.5"
          style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)", animation: "fcSlideIn 0.3s cubic-bezier(0.16,1,0.3,1) both" }}>
          {[80, 62, 75, 48].map((w, i) => (
            <div key={i} className="h-1.5 rounded-full" style={{ width: `${w}%`, background: "var(--cm-border2)" }} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Keyboard Shortcuts ───────────────────────────────────────────────────────
const KB_SHORTCUTS = [
  { keys: ["G", "I"], label: "Go to Inbox"   },
  { keys: ["⌘", "K"], label: "Quick actions" },
  { keys: ["R"],      label: "Reply"          },
  { keys: ["E"],      label: "Archive"        },
];

export function KeyboardAnimation({ paused = false }: { paused?: boolean }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (paused) { setActive(0); return; }
    const id = setInterval(() => setActive(a => (a + 1) % KB_SHORTCUTS.length), 1100);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <div className="mt-4 space-y-2">
      {KB_SHORTCUTS.map((s, i) => {
        const on = i === active;
        return (
          <div key={s.label} className="flex items-center gap-3">
            <div className="flex gap-1">
              {s.keys.map(k => (
                <kbd key={k}
                  className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-md border px-1.5 text-[11px] font-[700]"
                  style={{
                    borderColor: on ? "var(--cm-accent)" : "var(--cm-border2)",
                    background: on ? "rgba(249,115,22,0.10)" : "var(--cm-surface3)",
                    color: on ? "var(--cm-accent)" : "var(--cm-text2)",
                    boxShadow: on ? "0 2px 0 rgba(249,115,22,0.28)" : "0 2px 0 var(--cm-border2)",
                    transform: on ? "translateY(1px)" : "none",
                    transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
                  }}>
                  {k}
                </kbd>
              ))}
            </div>
            <span className="text-[11.5px] transition-all duration-200"
              style={{ color: on ? "var(--cm-text)" : "var(--cm-text3)", fontWeight: on ? 600 : 400 }}>
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── AI Categorisation ────────────────────────────────────────────────────────
const AI_ITEMS = [
  { label: "Primary", color: "#0044BC", bg: "rgba(0,68,188,0.09)",  sub: "Re: Project kickoff"  },
  { label: "Finance", color: "#D97706", bg: "rgba(217,119,6,0.09)", sub: "Invoice #2048 due"    },
  { label: "Updates", color: "#059669", bg: "rgba(5,150,105,0.09)", sub: "GitHub digest"        },
];

export function AiAnimation({ paused = false }: { paused?: boolean }) {
  const [hi, setHi] = useState(0);

  useEffect(() => {
    if (paused) { setHi(0); return; }
    const id = setInterval(() => setHi(h => (h + 1) % AI_ITEMS.length), 1500);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <div className="mt-4 space-y-1.5">
      {AI_ITEMS.map((e, i) => {
        const on = i === hi;
        return (
          <div key={e.label}
            className="flex items-center gap-2.5 rounded-xl border px-3 py-2 transition-all duration-400"
            style={{ borderColor: on ? `${e.color}28` : "transparent", background: on ? e.bg : "var(--cm-surface2)" }}>
            <span className="text-[11px]">📧</span>
            <span className="flex-1 truncate text-[11.5px] font-[600]" style={{ color: "var(--cm-text2)" }}>{e.sub}</span>
            <span className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-[800] transition-all duration-400"
              style={{ background: on ? e.bg : "var(--cm-surface3)", color: on ? e.color : "var(--cm-text3)" }}>
              {e.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Team Collaboration ───────────────────────────────────────────────────────
const TEAM = [
  { initials: "JD", g: "from-[#F97316] to-[#EA580C]" },
  { initials: "SL", g: "from-[#0044BC] to-[#003399]" },
  { initials: "MR", g: "from-[#7C3AED] to-[#6D28D9]" },
  { initials: "KT", g: "from-[#059669] to-[#047857]" },
];

export function TeamAnimation({ paused = false }: { paused?: boolean }) {
  const [typer, setTyper] = useState(0);

  useEffect(() => {
    if (paused) { setTyper(0); return; }
    const id = setInterval(() => setTyper(t => (t + 1) % TEAM.length), 1800);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <div className="mt-4 rounded-xl border px-3 py-3"
      style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)" }}>
      <div className="mb-2.5 flex items-center gap-2">
        <div className="flex -space-x-2">
          {TEAM.map(m => (
            <div key={m.initials}
              className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${m.g} text-[9px] font-[800] text-white`}
              style={{ boxShadow: "0 0 0 2px var(--cm-surface2)" }}>
              {m.initials}
            </div>
          ))}
        </div>
        <span className="text-[11px] font-[600]" style={{ color: "var(--cm-text3)" }}>4 members · 2 online</span>
      </div>
      <div className="flex items-center gap-2">
        <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${TEAM[typer].g} text-[7px] font-[800] text-white`}>
          {TEAM[typer].initials}
        </div>
        <div className="flex items-end gap-0.5 pb-0.5">
          {[0, 1, 2].map(d => (
            <div key={d} className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--cm-text3)", animation: `typingDot 1.1s ease-in-out ${d * 0.18}s infinite` }} />
          ))}
        </div>
        <span className="text-[10.5px]" style={{ color: "var(--cm-text3)" }}>composing a reply…</span>
      </div>
    </div>
  );
}

// ─── Two-Factor Auth (live TOTP) ──────────────────────────────────────────────
function makeCode() {
  return `${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)}`;
}

export function TotpAnimation({ paused = false }: { paused?: boolean }) {
  const [code, setCode] = useState("482 931");
  const [secs, setSecs] = useState(22);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (paused) { setCode("482 931"); setSecs(22); setFade(false); return; }
    const id = setInterval(() => {
      setSecs(s => {
        if (s <= 1) {
          setFade(true);
          setTimeout(() => { setCode(makeCode()); setSecs(30); setFade(false); }, 280);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [paused]);

  const pct = (secs / 30) * 100;
  const barColor = secs > 10 ? "#10B981" : "#EF4444";

  return (
    <div className="mt-4 rounded-xl border px-4 py-3 text-center"
      style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)" }}>
      <div className="mb-1 text-[9px] font-[700] uppercase tracking-[0.18em]" style={{ color: "var(--cm-text3)" }}>
        Authenticator code
      </div>
      <div className="font-mono text-[22px] font-[900] tracking-[0.18em]"
        style={{ color: "var(--cm-text)", opacity: fade ? 0 : 1, transition: "opacity 0.25s" }}>
        {code}
      </div>
      <div className="mx-auto mt-2 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--cm-border2)" }}>
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: barColor }} />
      </div>
      <div className="mt-1.5 text-[10px]" style={{ color: secs <= 10 ? "#EF4444" : "var(--cm-text3)" }}>
        Expires in {secs}s
      </div>
    </div>
  );
}

// ─── No Lock-in (provider cycling) ───────────────────────────────────────────
const PROVIDERS = ["Gmail", "Outlook", "Hostcari", "Fastmail"];

export function ProviderAnimation({ paused = false }: { paused?: boolean }) {
  const [hi, setHi] = useState(0);

  useEffect(() => {
    if (paused) { setHi(0); return; }
    const id = setInterval(() => setHi(h => (h + 1) % PROVIDERS.length), 1200);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <div className="mt-4 space-y-1">
      {PROVIDERS.map((p, i) => {
        const on = i === hi;
        return (
          <div key={p} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-all duration-300"
            style={{ background: on ? "rgba(0,68,188,0.07)" : "transparent" }}>
            <div className="h-2 w-2 rounded-full transition-all duration-300"
              style={{ background: on ? "#10B981" : "var(--cm-border2)", boxShadow: on ? "0 0 6px #10B981" : "none" }} />
            <span className="flex-1 text-[12px] font-[600] transition-colors duration-300"
              style={{ color: on ? "var(--cm-text)" : "var(--cm-text3)" }}>
              {p}
            </span>
            {on && (
              <span className="text-[9px] font-[800] text-emerald-500" style={{ animation: "fcSlideIn 0.2s both" }}>
                Connected
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
