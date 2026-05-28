import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="animate-fade-up">
      <h1 className="text-[20px] font-[900] tracking-tight" style={{ color: "var(--cm-text)" }}>
        Terms of Service
      </h1>
      <p className="mt-1 text-[12px]" style={{ color: "var(--cm-text3)" }}>
        Last updated: {new Date().getFullYear()}
      </p>

      <div className="mt-5 space-y-4 text-[13px] leading-relaxed" style={{ color: "var(--cm-text2)" }}>
        <p>
          By using Carimail, you agree to use the service for lawful purposes only.
          Carimail provides a client interface to connect with your own IMAP/SMTP mail servers.
          We do not host, store, or scan your email content.
        </p>

        <div>
          <p className="font-[700]" style={{ color: "var(--cm-text)" }}>Credential security</p>
          <p className="mt-1">
            Your email account passwords are encrypted using AES-256 before storage and are never
            transmitted in plain text. You are responsible for keeping your Carimail account secure.
          </p>
        </div>

        <div>
          <p className="font-[700]" style={{ color: "var(--cm-text)" }}>Account termination</p>
          <p className="mt-1">
            We reserve the right to suspend or terminate accounts that violate these terms
            or that are used for abuse, spam, or other harmful activities.
          </p>
        </div>

        <div>
          <p className="font-[700]" style={{ color: "var(--cm-text)" }}>Disclaimer</p>
          <p className="mt-1">
            Carimail is provided &ldquo;as is&rdquo; without warranties of any kind. Hostcari is not responsible
            for any data loss or interruptions to service.
          </p>
        </div>

        <p>
          Questions? Contact us at{" "}
          <a href="mailto:support@hostcari.com" style={{ color: "var(--cm-blue)" }}>
            support@hostcari.com
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
