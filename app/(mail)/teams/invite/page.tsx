"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Users, XCircle } from "lucide-react";

export default function TeamInvitePage() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get("token") ?? "";
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [msg, setMsg]     = useState("");

  useEffect(() => {
    if (!token) { setState("error"); setMsg("Missing invite token."); return; }
    fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "accept-invite", token }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.ok) { setState("ok"); setTimeout(() => router.push("/inbox"), 2500); }
        else { setState("error"); setMsg(d.error ?? "Invalid or expired invite."); }
      })
      .catch(() => { setState("error"); setMsg("Something went wrong."); });
  }, [token, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-5 text-center"
      style={{ background: "var(--cm-bg)" }}>
      {state === "loading" && (
        <>
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--cm-text3)" }} />
          <p className="text-[14px]" style={{ color: "var(--cm-text2)" }}>Accepting invite…</p>
        </>
      )}
      {state === "ok" && (
        <>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "rgba(16,185,129,0.10)", color: "#10B981" }}>
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-[20px] font-[900]" style={{ color: "var(--cm-text)" }}>You&apos;re in!</h1>
            <p className="mt-2 text-[13.5px]" style={{ color: "var(--cm-text2)" }}>You&apos;ve joined the team. Redirecting to your inbox…</p>
          </div>
        </>
      )}
      {state === "error" && (
        <>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "rgba(239,68,68,0.10)", color: "#DC2626" }}>
            <XCircle className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-[20px] font-[900]" style={{ color: "var(--cm-text)" }}>Invite failed</h1>
            <p className="mt-2 text-[13.5px]" style={{ color: "var(--cm-text2)" }}>{msg}</p>
          </div>
          <button type="button" onClick={() => router.push("/sign-in")}
            className="rounded-2xl px-5 py-2.5 text-[13.5px] font-[700] text-white"
            style={{ background: "var(--cm-blue)" }}>
            Sign in →
          </button>
        </>
      )}
    </div>
  );
}
