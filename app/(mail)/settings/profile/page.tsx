"use client";
// app/(mail)/settings/profile/page.tsx
import { useEffect, useState } from "react";
import {
  AlertCircle, CheckCircle2, Eye, EyeOff,
  Loader2, Lock, User, X,
} from "lucide-react";

const inputCls = "w-full rounded-xl border border-[#0F172A]/10 bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition focus:border-[#FF914D] focus:bg-white placeholder:text-[#94A3B8]";

function Notice({ type, message, onDismiss }: { type: "error" | "success"; message: string; onDismiss: () => void }) {
  return (
    <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
      <span className="mt-0.5 shrink-0">
        {type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
      </span>
      <span className="flex-1">{message}</span>
      <button type="button" onClick={onDismiss} className="shrink-0 opacity-50 hover:opacity-100 transition">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

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
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) { setName(d.user.name || ""); setEmail(d.user.email || ""); }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function notify(type: "error" | "success", msg: string) {
    setError(""); setSuccess("");
    if (type === "error") setError(msg);
    else setSuccess(msg);
    setTimeout(() => { setError(""); setSuccess(""); }, 5000);
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update-profile", name }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed to save.");
      notify("success", "Profile updated successfully.");
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setChangingPassword(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "change-password", currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed.");
      notify("success", "Password changed successfully.");
      setCurrentPassword(""); setNewPassword("");
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Failed.");
    } finally {
      setChangingPassword(false);
    }
  }

  // Password strength
  const strength = newPassword.length === 0 ? 0
    : newPassword.length < 8 ? 1
    : newPassword.length < 12 ? 2
    : /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) ? 4 : 3;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-[#0044BC]", "bg-emerald-500"];
  const strengthText = ["", "text-red-500", "text-amber-500", "text-[#0044BC]", "text-emerald-600"];

  return (
    <div className="min-h-full bg-[#F4F7FB]">
      {/* Header */}
      <div className="border-b border-slate-200/80 bg-white/80 backdrop-blur-xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#0044BC]">Settings</div>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-[#0F172A]">Profile</h1>
          <p className="mt-1 text-sm text-[#64748B]">Update your display name and account password.</p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8 space-y-5">
        {(error || success) && (
          <Notice type={error ? "error" : "success"} message={error || success} onDismiss={() => { setError(""); setSuccess(""); }} />
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-sm text-[#64748B]">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">

            {/* Personal info */}
            <div className="overflow-hidden rounded-[24px] border border-white/70 bg-white/90 shadow-[0_12px_32px_rgba(15,23,42,0.06)] backdrop-blur-xl">
              <div className="flex items-center gap-3 border-b border-[#0F172A]/6 px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF4FF] text-[#0044BC]">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#0F172A]">Personal info</div>
                  <div className="text-xs text-[#64748B]">Your name and login email</div>
                </div>
              </div>

              {/* Avatar preview */}
              <div className="flex items-center gap-4 border-b border-[#0F172A]/6 bg-[#F8FAFC]/60 px-5 py-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FF914D] to-[#0044BC] text-base font-bold text-white shadow-[0_4px_12px_rgba(255,145,77,0.28)]">
                  {(name || email).charAt(0).toUpperCase() || "?"}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-[#0F172A]">{name || "Your name"}</div>
                  <div className="truncate text-xs text-[#94A3B8]">{email}</div>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 p-5">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#334155]">Full name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Your name" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#334155]">Email address</label>
                  <input value={email} readOnly className={`${inputCls} cursor-not-allowed opacity-50`} />
                  <p className="mt-1.5 text-[11px] text-[#94A3B8]">Contact support to change your login email.</p>
                </div>
                <button type="submit" disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0044BC] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#003399] disabled:opacity-60">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </form>
            </div>

            {/* Change password */}
            <div className="overflow-hidden rounded-[24px] border border-white/70 bg-white/90 shadow-[0_12px_32px_rgba(15,23,42,0.06)] backdrop-blur-xl">
              <div className="flex items-center gap-3 border-b border-[#0F172A]/6 px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF6EE] text-[#FF914D]">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#0F172A]">Change password</div>
                  <div className="text-xs text-[#64748B]">Update your account password</div>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4 p-5">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#334155]">Current password</label>
                  <div className="relative">
                    <input type={showCurrent ? "text" : "password"} value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={`${inputCls} pr-10`} placeholder="••••••••" required />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] transition">
                      {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#334155]">New password</label>
                  <div className="relative">
                    <input type={showNew ? "text" : "password"} value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`${inputCls} pr-10`} placeholder="8+ characters" required minLength={8} />
                    <button type="button" onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] transition">
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {newPassword && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor[strength] : "bg-[#E2E8F0]"}`} />
                        ))}
                      </div>
                      <p className={`text-[11px] font-semibold ${strengthText[strength]}`}>{strengthLabel[strength]}</p>
                    </div>
                  )}
                </div>

                <button type="submit" disabled={changingPassword}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0F172A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1E293B] disabled:opacity-60">
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