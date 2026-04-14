"use client";
// app/(mail)/settings/profile/page.tsx
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, User, Lock, Eye, EyeOff } from "lucide-react";

const inputCls = "w-full rounded-xl border border-[#0F172A]/10 bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition focus:border-[#FF914D] focus:bg-white focus:ring-4 focus:ring-[#FF914D]/15 placeholder:text-[#94A3B8]";

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
        if (d.ok) {
          setName(d.user.name || "");
          setEmail(d.user.email || "");
        }
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
      notify("success", "Profile updated.");
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
      notify("success", "Password changed.");
      setCurrentPassword(""); setNewPassword("");
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Failed.");
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <div className="min-h-full bg-[#F4F7FB] p-6">
      <div className="mx-auto max-w-xl space-y-5">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">Profile</h1>
          <p className="mt-1 text-sm text-[#64748B]">Update your name and password.</p>
        </div>

        {(error || success) && (
          <div className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
            {error ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
            {error || success}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-[#64748B]">
            <Loader2 className="h-4 w-4 animate-spin" />Loading…
          </div>
        ) : (
          <>
            {/* Profile info */}
            <div className="overflow-hidden rounded-[24px] border border-white/70 bg-white/90 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-3 border-b border-[#0F172A]/6 px-5 py-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EEF4FF] text-[#0044BC]">
                  <User className="h-4 w-4" />
                </div>
                <div className="text-sm font-semibold text-[#0F172A]">Personal info</div>
              </div>
              <form onSubmit={handleSaveProfile} className="space-y-4 p-5">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#334155]">Full name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Your name" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#334155]">Email address</label>
                  <input value={email} readOnly className={`${inputCls} cursor-not-allowed opacity-60`} />
                  <p className="mt-1 text-[11px] text-[#94A3B8]">Contact support to change your login email.</p>
                </div>
                <button type="submit" disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0044BC] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#003399] disabled:opacity-60">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </form>
            </div>

            {/* Change password */}
            <div className="overflow-hidden rounded-[24px] border border-white/70 bg-white/90 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-3 border-b border-[#0F172A]/6 px-5 py-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFF6EE] text-[#FF914D]">
                  <Lock className="h-4 w-4" />
                </div>
                <div className="text-sm font-semibold text-[#0F172A]">Change password</div>
              </div>
              <form onSubmit={handleChangePassword} className="space-y-4 p-5">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#334155]">Current password</label>
                  <div className="relative">
                    <input type={showCurrent ? "text" : "password"} value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={`${inputCls} pr-10`} placeholder="••••••••" required />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]">
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]">
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={changingPassword}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0F172A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1E293B] disabled:opacity-60">
                  {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {changingPassword ? "Updating…" : "Change password"}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
