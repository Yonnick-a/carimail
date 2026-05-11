"use client";
// app/(mail)/settings/profile/page.tsx
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, Lock, User, X } from "lucide-react";

function Notice({ type, message, onDismiss }: { type: "error" | "success"; message: string; onDismiss: () => void }) {
  return (
    <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-[12.5px] ${type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
      <span className="mt-0.5 shrink-0">
        {type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
      </span>
      <span className="flex-1">{message}</span>
      <button type="button" onClick={onDismiss} className="shrink-0 opacity-50 hover:opacity-100 transition"><X className="h-4 w-4" /></button>
    </div>
  );
}

const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
const strengthColor = ["", "#EF4444", "#F59E0B", "#0044BC", "#10B981"];

export default function ProfileSettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/auth/profile")
      .then(r => r.json())
      .then(d => { if (d.ok) { setName(d.user.name || ""); setEmail(d.user.email || ""); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function notify(type: "error" | "success", msg: string) {
    setError(""); setSuccess("");
    if (type === "error") setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(""); setSuccess(""); }, 5000);
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "update-profile", name }) });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed.");
      notify("success", "Profile updated successfully.");
    } catch (err) { notify("error", err instanceof Error ? err.message : "Failed."); }
    finally { setSaving(false); }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault(); setChangingPassword(true);
    try {
      const res = await fetch("/api/auth/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "change-password", currentPassword, newPassword }) });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed.");
      notify("success", "Password changed successfully.");
      setCurrentPassword(""); setNewPassword("");
    } catch (err) { notify("error", err instanceof Error ? err.message : "Failed."); }
    finally { setChangingPassword(false); }
  }

  const strength = newPassword.length === 0 ? 0 : newPassword.length < 8 ? 1 : newPassword.length < 12 ? 2 : /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) ? 4 : 3;

  const inputCls = "w-full rounded-xl border py-2.5 px-3.5 text-[13px] outline-none transition";
  const inputStyle = { borderColor: "var(--cm-border)", background: "var(--cm-input-bg)", color: "var(--cm-text)" };
  function onFocus(e: React.FocusEvent<HTMLInputElement>) { e.target.style.borderColor = "var(--cm-accent)"; e.target.style.boxShadow = "0 0 0 3px var(--cm-accent-dim)"; }
  function onBlur(e: React.FocusEvent<HTMLInputElement>) { e.target.style.borderColor = "var(--cm-border)"; e.target.style.boxShadow = "none"; }

  const cardStyle = { background: "var(--cm-surface)", border: `1px solid var(--cm-border)` };

  return (
    <div className="min-h-full" style={{ background: "var(--cm-bg)" }}>
      <div className="border-b px-4 py-5 sm:px-6 lg:px-8" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
        <div className="mx-auto max-w-5xl">
          <p className="text-[10px] font-[700] uppercase tracking-[0.24em]" style={{ color: "var(--cm-blue)" }}>Settings</p>
          <h1 className="mt-1 text-[20px] font-[800] tracking-tight" style={{ color: "var(--cm-text)" }}>Profile</h1>
          <p className="mt-1 text-[13px]" style={{ color: "var(--cm-text2)" }}>Update your display name and account password.</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 space-y-5">
        {(error || success) && (
          <Notice type={error ? "error" : "success"} message={error || success} onDismiss={() => { setError(""); setSuccess(""); }} />
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16" style={{ color: "var(--cm-text3)" }}>
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Personal info */}
            <div className="overflow-hidden rounded-[22px]" style={cardStyle}>
              <div className="flex items-center gap-3 border-b px-5 py-4" style={{ borderColor: "var(--cm-border)" }}>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "var(--cm-blue-light)", color: "var(--cm-blue)" }}>
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[13.5px] font-[700]" style={{ color: "var(--cm-text)" }}>Personal info</div>
                  <div className="text-[11.5px]" style={{ color: "var(--cm-text2)" }}>Your name and login email</div>
                </div>
              </div>

              {/* Avatar preview */}
              <div className="flex items-center gap-4 border-b px-5 py-4" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)" }}>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F97316] to-[#0044BC] text-[15px] font-[800] text-white shadow"
                  style={{ boxShadow: "0 4px 12px var(--cm-accent-b)" }}>
                  {(name || email).charAt(0).toUpperCase() || "?"}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[13.5px] font-[700]" style={{ color: "var(--cm-text)" }}>{name || "Your name"}</div>
                  <div className="truncate text-[11.5px]" style={{ color: "var(--cm-text3)" }}>{email}</div>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 p-5">
                <div>
                  <label className="mb-1.5 block text-[11.5px] font-[600]" style={{ color: "var(--cm-text2)" }}>Full name</label>
                  <input value={name} onChange={e => setName(e.target.value)} className={inputCls} style={inputStyle} placeholder="Your name" onFocus={onFocus} onBlur={onBlur} />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11.5px] font-[600]" style={{ color: "var(--cm-text2)" }}>Email address</label>
                  <input value={email} readOnly className={`${inputCls} cursor-not-allowed opacity-40`} style={inputStyle} />
                  <p className="mt-1.5 text-[11px]" style={{ color: "var(--cm-text3)" }}>Contact support to change your login email.</p>
                </div>
                <button type="submit" disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-[700] text-white transition disabled:opacity-60"
                  style={{ background: "var(--cm-blue)", boxShadow: "0 4px 12px rgba(0,68,188,0.22)" }}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </form>
            </div>

            {/* Change password */}
            <div className="overflow-hidden rounded-[22px]" style={cardStyle}>
              <div className="flex items-center gap-3 border-b px-5 py-4" style={{ borderColor: "var(--cm-border)" }}>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "var(--cm-accent-dim)", color: "var(--cm-accent)" }}>
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[13.5px] font-[700]" style={{ color: "var(--cm-text)" }}>Change password</div>
                  <div className="text-[11.5px]" style={{ color: "var(--cm-text2)" }}>Update your account password</div>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4 p-5">
                <div>
                  <label className="mb-1.5 block text-[11.5px] font-[600]" style={{ color: "var(--cm-text2)" }}>Current password</label>
                  <div className="relative">
                    <input type={showCurrent ? "text" : "password"} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                      className={`${inputCls} pr-10`} style={inputStyle} placeholder="••••••••" required onFocus={onFocus} onBlur={onBlur} />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3.5 top-1/2 -translate-y-1/2 transition" style={{ color: "var(--cm-text3)" }}>
                      {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-[11.5px] font-[600]" style={{ color: "var(--cm-text2)" }}>New password</label>
                  <div className="relative">
                    <input type={showNew ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      className={`${inputCls} pr-10`} style={inputStyle} placeholder="8+ characters" required minLength={8} onFocus={onFocus} onBlur={onBlur} />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3.5 top-1/2 -translate-y-1/2 transition" style={{ color: "var(--cm-text3)" }}>
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {newPassword && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex gap-1">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                            style={{ background: i <= strength ? strengthColor[strength] : "var(--cm-border2)" }} />
                        ))}
                      </div>
                      <p className="text-[11px] font-[600]" style={{ color: strengthColor[strength] }}>{strengthLabel[strength]}</p>
                    </div>
                  )}
                </div>
                <button type="submit" disabled={changingPassword}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-[700] text-white transition disabled:opacity-60"
                  style={{ background: "var(--cm-text)" }}>
                  {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  {changingPassword ? "Updating…" : "Change password"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
