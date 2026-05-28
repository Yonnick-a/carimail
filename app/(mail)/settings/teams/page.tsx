"use client";
import { useEffect, useState } from "react";
import {
  AlertCircle, Check, CheckCircle2, Crown, Link as LinkIcon,
  Loader2, Mail, Plus, Trash2, UserMinus, Users, X,
} from "lucide-react";

type TeamMember = { id: string; role: string; user: { id: string; name: string | null; email: string } };
type SharedAccount = { account: { id: string; emailAddress: string; label: string | null } };
type TeamInvite = { id: string; email: string; role: string; expiresAt: string };
type Team = {
  id: string; name: string; ownerId: string; myRole: string;
  members: TeamMember[];
  invites: TeamInvite[];
  sharedAccounts: SharedAccount[];
};

function Notice({ type, message, onDismiss }: { type: "error" | "success"; message: string; onDismiss: () => void }) {
  return (
    <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-[12.5px] ${type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
      <span className="mt-0.5 shrink-0">{type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}</span>
      <span className="flex-1">{message}</span>
      <button type="button" onClick={onDismiss}><X className="h-4 w-4 opacity-50 hover:opacity-100" /></button>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    owner: { bg: "rgba(249,115,22,0.12)", color: "var(--cm-accent)" },
    admin: { bg: "var(--cm-blue-light)", color: "var(--cm-blue)" },
    member: { bg: "var(--cm-surface3)", color: "var(--cm-text3)" },
  };
  const s = styles[role] ?? styles.member;
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-[700] capitalize"
      style={{ background: s.bg, color: s.color }}>
      {role === "owner" && <Crown className="h-2.5 w-2.5" />}
      {role}
    </span>
  );
}

export default function TeamsSettingsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [inviteEmail, setInviteEmail] = useState<Record<string, string>>({});
  const [inviteLinks, setInviteLinks] = useState<Record<string, string>>({});
  const [userAccounts, setUserAccounts] = useState<{ id: string; emailAddress: string }[]>([]);

  async function loadTeams() {
    try {
      const d = await fetch("/api/teams").then(r => r.json());
      if (d.ok) setTeams(d.teams ?? []);
    } catch {}
    finally { setLoading(false); }
  }

  useEffect(() => {
    loadTeams();
    fetch("/api/mail/accounts").then(r => r.json()).then(d => setUserAccounts(d.accounts ?? [])).catch(() => {});
  }, []);

  function notify(type: "error" | "success", message: string) {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 5000);
  }

  async function createTeam(e: React.FormEvent) {
    e.preventDefault(); if (!newTeamName.trim()) return;
    setBusy(true);
    try {
      const d = await fetch("/api/teams", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newTeamName }) }).then(r => r.json());
      if (!d.ok) throw new Error(d.error);
      notify("success", `Team "${newTeamName}" created!`);
      setNewTeamName(""); setShowCreate(false);
      await loadTeams();
    } catch (err) { notify("error", err instanceof Error ? err.message : "Failed."); }
    finally { setBusy(false); }
  }

  async function invite(teamId: string) {
    const email = inviteEmail[teamId]?.trim();
    if (!email) return;
    setBusy(true);
    try {
      const d = await fetch(`/api/teams/${teamId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "invite", email }) }).then(r => r.json());
      if (!d.ok) throw new Error(d.error);
      setInviteLinks(prev => ({ ...prev, [teamId]: d.link }));
      setInviteEmail(prev => ({ ...prev, [teamId]: "" }));
      notify("success", `Invite sent to ${email}`);
      await loadTeams();
    } catch (err) { notify("error", err instanceof Error ? err.message : "Failed."); }
    finally { setBusy(false); }
  }

  async function removeMember(teamId: string, userId: string) {
    if (!confirm("Remove this member?")) return;
    await fetch(`/api/teams/${teamId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "remove-member", userId }) });
    await loadTeams();
  }

  async function addAccount(teamId: string, accountId: string) {
    await fetch(`/api/teams/${teamId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "add-account", accountId }) });
    await loadTeams();
  }

  async function removeAccount(teamId: string, accountId: string) {
    await fetch(`/api/teams/${teamId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "remove-account", accountId }) });
    await loadTeams();
  }

  async function deleteTeam(team: Team) {
    if (!confirm(`Delete team "${team.name}"? This cannot be undone.`)) return;
    await fetch(`/api/teams/${team.id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete" }) });
    await loadTeams();
  }

  const inputCls = "w-full rounded-xl border py-2.5 px-3.5 text-[13px] outline-none transition";
  const inputStyle = { borderColor: "var(--cm-border)", background: "var(--cm-input-bg)", color: "var(--cm-text)" };

  return (
    <div className="min-h-full" style={{ background: "var(--cm-bg)" }}>
      <div className="border-b px-4 py-5 sm:px-6 lg:px-8" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
        <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-[700] uppercase tracking-[0.24em]" style={{ color: "var(--cm-blue)" }}>Settings</p>
            <h1 className="mt-1 text-[20px] font-[800] tracking-tight" style={{ color: "var(--cm-text)" }}>Teams</h1>
            <p className="mt-1 text-[13px]" style={{ color: "var(--cm-text2)" }}>Share mailboxes with colleagues and manage team access.</p>
          </div>
          <button type="button" onClick={() => setShowCreate(v => !v)}
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-[13px] font-[700] text-white transition"
            style={{ background: "linear-gradient(135deg, var(--cm-accent), var(--cm-accent2))", boxShadow: "0 4px 14px var(--cm-accent-b)" }}>
            <Plus className="h-4 w-4" />{showCreate ? "Cancel" : "New team"}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        {notice && <Notice type={notice.type} message={notice.message} onDismiss={() => setNotice(null)} />}

        {/* Create form */}
        {showCreate && (
          <form onSubmit={createTeam} className="flex items-center gap-3 overflow-hidden rounded-2xl border p-5"
            style={{ borderColor: "var(--cm-accent-b)", background: "var(--cm-surface)" }}>
            <Users className="h-5 w-5 shrink-0" style={{ color: "var(--cm-accent)" }} />
            <input value={newTeamName} onChange={e => setNewTeamName(e.target.value)} placeholder="Team name…" required
              className={`${inputCls} flex-1`} style={inputStyle}
              autoFocus
              onFocus={e => { e.target.style.borderColor = "var(--cm-accent)"; e.target.style.boxShadow = "0 0 0 3px var(--cm-accent-dim)"; }}
              onBlur={e => { e.target.style.borderColor = "var(--cm-border)"; e.target.style.boxShadow = "none"; }} />
            <button type="submit" disabled={busy || !newTeamName.trim()}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-[700] text-white disabled:opacity-50"
              style={{ background: "var(--cm-blue)" }}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Create
            </button>
          </form>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16" style={{ color: "var(--cm-text3)" }}>
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border px-6 py-16 text-center"
            style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "var(--cm-blue-light)", color: "var(--cm-blue)" }}>
              <Users className="h-8 w-8" />
            </div>
            <div>
              <p className="text-[14px] font-[700]" style={{ color: "var(--cm-text)" }}>No teams yet</p>
              <p className="mt-1 text-[12.5px]" style={{ color: "var(--cm-text2)" }}>Create a team to share mailboxes with colleagues.</p>
            </div>
            <button type="button" onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-[13px] font-[700] text-white"
              style={{ background: "var(--cm-blue)" }}>
              <Plus className="h-4 w-4" />Create team
            </button>
          </div>
        ) : (
          teams.map(team => (
            <div key={team.id} className="overflow-hidden rounded-2xl border" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
              {/* Team header */}
              <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "var(--cm-border)" }}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "var(--cm-blue-light)", color: "var(--cm-blue)" }}>
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-[800]" style={{ color: "var(--cm-text)" }}>{team.name}</span>
                      <RoleBadge role={team.myRole} />
                    </div>
                    <p className="text-[11.5px]" style={{ color: "var(--cm-text3)" }}>
                      {team.members.length} member{team.members.length !== 1 ? "s" : ""} · {team.sharedAccounts.length} shared mailbox{team.sharedAccounts.length !== 1 ? "es" : ""}
                    </p>
                  </div>
                </div>
                {team.myRole === "owner" && (
                  <button type="button" onClick={() => deleteTeam(team)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="grid gap-0 lg:grid-cols-2">
                {/* Members */}
                <div className="border-b p-5 lg:border-b-0 lg:border-r" style={{ borderColor: "var(--cm-border)" }}>
                  <p className="mb-3 text-[11px] font-[800] uppercase tracking-[0.18em]" style={{ color: "var(--cm-text3)" }}>Members</p>
                  <div className="space-y-2">
                    {team.members.map(m => (
                      <div key={m.id} className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F97316] to-[#0044BC] text-[10px] font-[700] text-white">
                          {(m.user.name || m.user.email).charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[12.5px] font-[600]" style={{ color: "var(--cm-text)" }}>{m.user.name || m.user.email}</div>
                          {m.user.name && <div className="truncate text-[11px]" style={{ color: "var(--cm-text3)" }}>{m.user.email}</div>}
                        </div>
                        <RoleBadge role={m.role} />
                        {team.myRole !== "member" && m.role !== "owner" && (
                          <button type="button" onClick={() => removeMember(team.id, m.user.id)} title="Remove member"
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-red-400 transition hover:bg-red-50">
                            <UserMinus className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pending invites */}
                  {team.invites.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <p className="text-[10.5px] font-[700]" style={{ color: "var(--cm-text3)" }}>Pending invites</p>
                      {team.invites.map(inv => (
                        <div key={inv.id} className="flex items-center gap-2 rounded-xl border px-3 py-2"
                          style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)" }}>
                          <Mail className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--cm-text3)" }} />
                          <span className="flex-1 truncate text-[11.5px]" style={{ color: "var(--cm-text2)" }}>{inv.email}</span>
                          <RoleBadge role={inv.role} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Invite form */}
                  {team.myRole !== "member" && (
                    <div className="mt-3 flex gap-2">
                      <input value={inviteEmail[team.id] ?? ""} onChange={e => setInviteEmail(prev => ({ ...prev, [team.id]: e.target.value }))}
                        placeholder="Invite by email…" type="email"
                        className="min-w-0 flex-1 rounded-xl border px-3 py-2 text-[12px] outline-none"
                        style={{ borderColor: "var(--cm-border)", background: "var(--cm-input-bg)", color: "var(--cm-text)" }}
                        onFocus={e => { e.target.style.borderColor = "var(--cm-accent)"; e.target.style.boxShadow = "0 0 0 3px var(--cm-accent-dim)"; }}
                        onBlur={e => { e.target.style.borderColor = "var(--cm-border)"; e.target.style.boxShadow = "none"; }} />
                      <button type="button" onClick={() => invite(team.id)} disabled={busy || !inviteEmail[team.id]?.trim()}
                        className="shrink-0 rounded-xl px-3 py-2 text-[12px] font-[700] text-white disabled:opacity-50"
                        style={{ background: "var(--cm-blue)" }}>
                        Invite
                      </button>
                    </div>
                  )}

                  {/* Copy invite link */}
                  {inviteLinks[team.id] && (
                    <button type="button"
                      onClick={() => { navigator.clipboard.writeText(inviteLinks[team.id]).catch(() => {}); }}
                      className="mt-2 flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-[11.5px] font-[600] transition hover:opacity-80"
                      style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)", color: "var(--cm-blue)" }}>
                      <LinkIcon className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">Copy invite link</span>
                    </button>
                  )}
                </div>

                {/* Shared mailboxes */}
                <div className="p-5">
                  <p className="mb-3 text-[11px] font-[800] uppercase tracking-[0.18em]" style={{ color: "var(--cm-text3)" }}>Shared mailboxes</p>
                  {team.sharedAccounts.length === 0 ? (
                    <p className="text-[12px]" style={{ color: "var(--cm-text3)" }}>No shared mailboxes yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {team.sharedAccounts.map(sa => (
                        <div key={sa.account.id} className="flex items-center gap-3 rounded-xl border px-3 py-2.5"
                          style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)" }}>
                          <Mail className="h-4 w-4 shrink-0" style={{ color: "var(--cm-text3)" }} />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[12.5px] font-[600]" style={{ color: "var(--cm-text)" }}>{sa.account.emailAddress}</div>
                            {sa.account.label && <div className="text-[10.5px]" style={{ color: "var(--cm-text3)" }}>{sa.account.label}</div>}
                          </div>
                          {team.myRole !== "member" && (
                            <button type="button" onClick={() => removeAccount(team.id, sa.account.id)}
                              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-red-400 transition hover:bg-red-50">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {team.myRole !== "member" && userAccounts.length > 0 && (
                    <div className="mt-3">
                      <p className="mb-1.5 text-[11px]" style={{ color: "var(--cm-text3)" }}>Add one of your accounts:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {userAccounts
                          .filter(a => !team.sharedAccounts.some(sa => sa.account.id === a.id))
                          .map(a => (
                            <button key={a.id} type="button" onClick={() => addAccount(team.id, a.id)}
                              className="inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[11.5px] font-[600] transition hover:opacity-80"
                              style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)", color: "var(--cm-text2)" }}>
                              <Plus className="h-3 w-3" />{a.emailAddress}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
