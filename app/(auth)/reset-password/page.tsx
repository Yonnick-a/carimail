// app/(auth)/reset-password/page.tsx
// Server wrapper — fixes useSearchParams Suspense build error

import { Suspense } from "react";
import ResetPasswordClient from "./ResetPasswordClient";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="animate-fade-up text-center">
          <div
            className="mx-auto mb-4 h-12 w-12 rounded-2xl"
            style={{ background: "var(--cm-accent-dim)" }}
          />
          <div
            className="mx-auto h-4 w-40 rounded-full"
            style={{ background: "var(--cm-border2)" }}
          />
          <div
            className="mx-auto mt-3 h-3 w-56 rounded-full"
            style={{ background: "var(--cm-border2)" }}
          />
        </div>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}