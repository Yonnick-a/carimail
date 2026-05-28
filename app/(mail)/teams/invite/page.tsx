import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import TeamInviteClient from "./TeamInviteClient";

export default function TeamInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center gap-3" style={{ color: "var(--cm-text3)" }}>
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      }
    >
      <TeamInviteClient />
    </Suspense>
  );
}
