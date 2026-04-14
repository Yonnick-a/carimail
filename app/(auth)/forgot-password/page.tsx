// app/(auth)/forgot-password/page.tsx
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div className="animate-fade-up">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#0044BC]">
        <Mail className="h-6 w-6" />
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">Reset your password</h1>
      <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
        Password reset is not yet available via the app. Please contact{" "}
        <a
          href="mailto:support@hostcari.com"
          className="font-semibold text-[#0044BC] hover:underline"
        >
          support@hostcari.com
        </a>{" "}
        and we&apos;ll reset it for you within 24 hours.
      </p>

      <Link
        href="/sign-in"
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0044BC] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </Link>
    </div>
  );
}
