"use client";
import { useEffect, useState } from "react";
import { Users, Crown, Shield, Clock, Bell, Send, Mail } from "lucide-react";

// ─── Multi-account ────────────────────────────────────────────────────────────
const ACCOUNTS = [
  { email: "you@gmail.com",        initials: "G", primary: true  },
  { email: "work@outlook.com",     initials: "W", primary: false },
  { email: "you@hostcari.com",     initials: "H", primary: false },
];

export function AccountsVisual() {
  const [notif, setNotif] = useState(-1);

  useEffect(() => {
    let alive = true;
    const cycle = () => {
      if (!alive) return;
      const idx = Math.floor(Math.random() * 3);
      setNotif(idx);
      setTimeout(() => { if (alive) { setNotif(-1); setTimeout(cycle, 1400); } }, 1800);
    };
    const t = setTimeout(cycle, 700);
    return () => { alive = false; clearTimeout(t); };
  }, []);

  return (
    <div className="w-full space-y-2.5">
      {ACCOUNTS.map((a, i) => (
        <div
          key={a.email}
          className="flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-all duration-350"
          style={{
            borderColor: notif === i ? "rgba(0,68,188,0.28)" : "var(--cm-border)",
            background: notif === i ? "rgba(0,68,188,0.04)" : "var(--cm-surface)",
            boxShadow: notif === i ? "0 4px 20px rgba(0,68,188,0.10)" : "0 2px 12px rgba(15,23,42,0.07)",
            transform: `translateX(${i * 10}px)`,
            opacity: 1 - i * 0.12,
          }}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F97316] to-[#0044BC] text-[10px] font-[800] text-white">
            {a.initials}
          </div>
          <span className="flex-1 text-[13px] font-[600]" style={{ color: "var(--cm-text)" }}>{a.email}</span>
          {a.primary && notif !== i && (
            <span className="rounded-full px-2 py-0.5 text-[9px] font-[800]"
              style={{ background: "rgba(0,68,188,0.10)", color: "#0044BC" }}>Primary</span>
          )}
          {notif === i ? (
            <span
              className="rounded-full px-2 py-0.5 text-[9px] font-[800] text-white"
              style={{ background: "#0044BC", animation: "fcSlideIn 0.2s both" }}
            >New</span>
          ) : (
            <span className="h-2 w-2 rounded-full" style={{ background: a.primary ? "#10B981" : "var(--cm-border2)" }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Conversations ────────────────────────────────────────────────────────────
const THREAD = [
  { name: "Sarah K.", time: "10:24 AM", left: true  },
  { name: "You",      time: "10:31 AM", left: false },
  { name: "Sarah K.", time: "10:45 AM", left: true  },
];

export function ConversationsVisual() {
  const [phase, setPhase] = useState<"static" | "typing" | "msg">("static");

  useEffect(() => {
    let alive = true;
    const run = () => {
      if (!alive) return;
      setPhase("static");
      setTimeout(() => { if (alive) setPhase("typing"); }, 1200);
      setTimeout(() => { if (alive) setPhase("msg"); }, 2600);
      setTimeout(() => { if (alive) run(); }, 5200);
    };
    run();
    return () => { alive = false; };
  }, []);

  return (
    <div className="w-full space-y-2">
      {THREAD.map((m, i) => (
        <div key={i} className="flex gap-2.5" style={{ flexDirection: m.left ? "row" : "row-reverse" }}>
          <div className="h-7 w-7 shrink-0 rounded-full"
            style={{ background: m.left ? "linear-gradient(135deg,#7C3AED,#6D28D9)" : "linear-gradient(135deg,#F97316,#EA580C)" }} />
          <div className="max-w-[75%] rounded-2xl border px-3.5 py-2.5"
            style={{ borderColor: "var(--cm-border)", background: m.left ? "var(--cm-surface)" : "rgba(124,58,237,0.07)", boxShadow: "0 1px 4px rgba(15,23,42,0.06)" }}>
            <div className="mb-1 flex items-center gap-2">
              <span className="text-[11px] font-[700]" style={{ color: "var(--cm-text)" }}>{m.name}</span>
              <span className="text-[10px]" style={{ color: "var(--cm-text3)" }}>{m.time}</span>
            </div>
            <div className="h-2 rounded-full" style={{ width: "85%", background: "var(--cm-border2)" }} />
            <div className="mt-1.5 h-2 rounded-full" style={{ width: "65%", background: "var(--cm-border2)", opacity: 0.6 }} />
          </div>
        </div>
      ))}

      {/* Fixed-height slot — typing and new message overlap here, only one visible at a time */}
      <div className="relative" style={{ height: 52 }}>
        {/* Typing indicator */}
        <div className="absolute inset-0 flex gap-2.5"
          style={{ opacity: phase === "typing" ? 1 : 0, transition: "opacity 0.25s", pointerEvents: phase === "typing" ? "auto" : "none" }}>
          <div className="h-7 w-7 shrink-0 rounded-full" style={{ background: "linear-gradient(135deg,#7C3AED,#6D28D9)" }} />
          <div className="rounded-2xl border px-3.5 py-3" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
            <div className="flex items-end gap-1">
              {[0, 1, 2].map(d => (
                <div key={d} className="h-1.5 w-1.5 rounded-full"
                  style={{ background: "var(--cm-text3)", animation: `typingDot 1.1s ease-in-out ${d * 0.18}s infinite` }} />
              ))}
            </div>
          </div>
        </div>
        {/* New message bubble */}
        <div className="absolute inset-0 flex gap-2.5"
          style={{ opacity: phase === "msg" ? 1 : 0, transition: "opacity 0.3s", pointerEvents: phase === "msg" ? "auto" : "none" }}>
          <div className="h-7 w-7 shrink-0 rounded-full" style={{ background: "linear-gradient(135deg,#7C3AED,#6D28D9)" }} />
          <div className="max-w-[75%] rounded-2xl border px-3.5 py-2.5"
            style={{ borderColor: "rgba(124,58,237,0.18)", background: "var(--cm-surface)", boxShadow: "0 2px 10px rgba(124,58,237,0.10)" }}>
            <div className="mb-1 flex items-center gap-2">
              <span className="text-[11px] font-[700]" style={{ color: "var(--cm-text)" }}>Sarah K.</span>
              <span className="text-[10px]" style={{ color: "var(--cm-text3)" }}>10:52 AM</span>
            </div>
            <div className="h-2 rounded-full" style={{ width: "90%", background: "var(--cm-border2)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Productivity ─────────────────────────────────────────────────────────────
const PROD_ACTIONS = [
  { icon: <Clock  className="h-5 w-5" />, label: "Snooze",        sub: "Return tomorrow at 9am",  color: "#D97706", bg: "rgba(217,119,6,0.10)"   },
  { icon: <Bell   className="h-5 w-5" />, label: "Remind me",     sub: "Follow up in 3 days",     color: "#7C3AED", bg: "rgba(124,58,237,0.10)"  },
  { icon: <Send   className="h-5 w-5" />, label: "Schedule send", sub: "Send Monday morning",     color: "#0044BC", bg: "rgba(0,68,188,0.10)"    },
];

export function ProductivityVisual() {
  const [hi, setHi] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setHi(h => (h + 1) % 3), 1600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full space-y-3">
      {PROD_ACTIONS.map((a, i) => (
        <div
          key={a.label}
          className="flex items-center gap-4 rounded-2xl border px-4 py-3.5 transition-all duration-400"
          style={{
            borderColor: i === hi ? `${a.color}38` : "var(--cm-border)",
            background: i === hi ? a.bg : "var(--cm-surface)",
            boxShadow: i === hi ? `0 4px 20px ${a.color}18` : "0 2px 12px rgba(15,23,42,0.07)",
          }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: a.bg, color: a.color }}>
            {a.icon}
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-[700]" style={{ color: a.color }}>{a.label}</div>
            <div className="text-[11.5px]" style={{ color: "var(--cm-text3)" }}>{a.sub}</div>
          </div>
          {i === hi && (
            <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: a.color, animation: "fcPulse 1.4s ease-in-out infinite" }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Teams ────────────────────────────────────────────────────────────────────
const TEAM_MEMBERS = [
  { initials: "JD", name: "Jordan D.", role: "owner",  grad: "from-[#F97316] to-[#EA580C]" },
  { initials: "SL", name: "Sarah L.",  role: "admin",  grad: "from-[#0044BC] to-[#003399]" },
  { initials: "MR", name: "Marc R.",   role: "member", grad: "from-[#7C3AED] to-[#6D28D9]" },
];

export function TeamsVisual() {
  const [typer, setTyper] = useState(1);
  const [count, setCount] = useState(3);

  useEffect(() => {
    const iv1 = setInterval(() => setTyper(t => (t + 1) % 3), 2000);
    const iv2 = setInterval(() => setCount(c => c + 1), 4500);
    return () => { clearInterval(iv1); clearInterval(iv2); };
  }, []);

  return (
    <div className="w-full space-y-3">
      <div className="rounded-2xl border px-4 py-4"
        style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)", boxShadow: "0 2px 12px rgba(15,23,42,0.07)" }}>
        <div className="mb-3 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "rgba(5,150,105,0.10)", color: "#059669" }}>
            <Users className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[13px] font-[800]" style={{ color: "var(--cm-text)" }}>Marketing Team</div>
            <div className="text-[10.5px]" style={{ color: "var(--cm-text3)" }}>3 members · 1 shared mailbox</div>
          </div>
        </div>
        <div className="space-y-2">
          {TEAM_MEMBERS.map((m, i) => (
            <div key={m.initials}
              className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-all duration-350"
              style={{ background: i === typer ? "rgba(5,150,105,0.07)" : "transparent" }}>
              <div className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${m.grad} text-[9px] font-[800] text-white`}>
                {m.initials}
              </div>
              <span className="flex-1 text-[12px] font-[600]" style={{ color: "var(--cm-text)" }}>{m.name}</span>
              {i === typer ? (
                <div className="flex items-end gap-0.5">
                  {[0, 1, 2].map(d => (
                    <div key={d} className="h-1.5 w-1.5 rounded-full"
                      style={{ background: "#059669", animation: `typingDot 1.1s ease-in-out ${d * 0.18}s infinite` }} />
                  ))}
                </div>
              ) : (
                <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-[800] capitalize"
                  style={{
                    background: m.role === "owner" ? "rgba(249,115,22,0.12)" : m.role === "admin" ? "rgba(0,68,188,0.10)" : "var(--cm-surface3)",
                    color: m.role === "owner" ? "#F97316" : m.role === "admin" ? "#0044BC" : "var(--cm-text3)",
                  }}>
                  {m.role === "owner" && <Crown className="h-2.5 w-2.5" />}
                  {m.role}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-xl border px-3 py-2"
          style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)" }}>
          <Mail className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--cm-text3)" }} />
          <span className="text-[11.5px] font-[600]" style={{ color: "var(--cm-text2)" }}>marketing@company.com</span>
          <span
            className="ml-auto rounded-full px-2 py-0.5 text-[9px] font-[800] text-white transition-all duration-500"
            style={{ background: "#059669" }}
          >
            {count}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Security / 2FA ───────────────────────────────────────────────────────────
function makeCode() {
  return `${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)}`;
}

export function SecurityVisual() {
  const [code, setCode] = useState("482 931");
  const [secs, setSecs] = useState(22);
  const [fade, setFade] = useState(false);

  useEffect(() => {
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
  }, []);

  const pct = (secs / 30) * 100;
  const barColor = secs > 10 ? "#10B981" : "#EF4444";

  return (
    <div className="w-full space-y-3">
      <div className="rounded-2xl border px-4 py-4"
        style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)", boxShadow: "0 2px 12px rgba(15,23,42,0.07)" }}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "rgba(220,38,38,0.10)", color: "#DC2626" }}>
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[13px] font-[800]" style={{ color: "var(--cm-text)" }}>Two-factor auth</div>
              <div className="text-[10.5px] font-[700] text-emerald-500">Enabled</div>
            </div>
          </div>
          <div className="h-5 w-9 rounded-full" style={{ background: "#10B981" }}>
            <div className="ml-auto mr-0.5 mt-0.5 h-4 w-4 rounded-full bg-white shadow" />
          </div>
        </div>
        <div className="rounded-xl border px-4 py-3 text-center"
          style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)" }}>
          <div className="mb-1 text-[10px] font-[700] uppercase tracking-[0.18em]" style={{ color: "var(--cm-text3)" }}>
            Authentication code
          </div>
          <div
            className="font-mono text-[26px] font-[900] tracking-[0.2em]"
            style={{ color: "var(--cm-text)", opacity: fade ? 0 : 1, transition: "opacity 0.25s" }}
          >
            {code}
          </div>
          <div className="mx-auto mt-1.5 h-1 w-full overflow-hidden rounded-full" style={{ background: "var(--cm-border2)" }}>
            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: barColor }} />
          </div>
          <div className="mt-1 text-[10px]" style={{ color: secs <= 10 ? "#EF4444" : "var(--cm-text3)" }}>
            Expires in {secs}s
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-xl border px-3 py-2.5"
        style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: "rgba(220,38,38,0.10)", color: "#DC2626" }}>
          <Shield className="h-3.5 w-3.5" />
        </div>
        <span className="text-[12px] font-[600]" style={{ color: "var(--cm-text)" }}>AES-256 encrypted storage</span>
        <div className="ml-auto h-2 w-2 rounded-full" style={{ background: "#10B981", animation: "fcPulse 2s ease-in-out infinite" }} />
      </div>
    </div>
  );
}
