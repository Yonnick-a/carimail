import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="animate-fade-up">
      <h1 className="text-[20px] font-[900] tracking-tight" style={{ color: "var(--cm-text)" }}>
        Privacy Policy
      </h1>
      <p className="mt-1 text-[12px]" style={{ color: "var(--cm-text3)" }}>
        Last updated: {new Date().getFullYear()}
      </p>

      <div className="mt-5 space-y-4 text-[13px] leading-relaxed" style={{ color: "var(--cm-text2)" }}>
        <p>
          Carimail respects your privacy. This policy explains what data we collect and how we use it.
        </p>

        <div>
          <p className="font-[700]" style={{ color: "var(--cm-text)" }}>What we store</p>
          <ul className="mt-1 ml-4 list-disc space-y-1">
            <li>Your name and email address (used for your Carimail account)</li>
            <li>A password hash (bcrypt) — your plain-text password is never stored</li>
            <li>IMAP/SMTP credentials, AES-256 encrypted — never logged in plain text</li>
            <li>Session tokens to keep you signed in (30-day expiry)</li>
            <li>A local cache of your email metadata (subjects, senders, dates) to power search</li>
          </ul>
        </div>

        <div>
          <p className="font-[700]" style={{ color: "var(--cm-text)" }}>What we do not do</p>
          <ul className="mt-1 ml-4 list-disc space-y-1">
            <li>We do not read, scan, or analyse your email content for advertising</li>
            <li>We do not sell your data to third parties</li>
            <li>We do not use tracking pixels or analytics SDKs</li>
          </ul>
        </div>

        <div>
          <p className="font-[700]" style={{ color: "var(--cm-text)" }}>Data deletion</p>
          <p className="mt-1">
            You may delete your account at any time. This removes all stored credentials,
            session data, and cached metadata from our systems.
          </p>
        </div>

        <p>
          Questions? Contact{" "}
          <a href="mailto:privacy@hostcari.com" style={{ color: "var(--cm-blue)" }}>
            privacy@hostcari.com
          </a>.
        </p>
      </div>

      <p className="mt-7 text-center text-[12.5px]" style={{ color: "var(--cm-text2)" }}>
        <Link href="/sign-in" className="font-[700] hover:underline" style={{ color: "var(--cm-blue)" }}>
          ← Back to sign in
        </Link>
      </p>
    </div>
  );
}
