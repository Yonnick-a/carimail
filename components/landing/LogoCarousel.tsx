"use client";

function GmailLogo() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-9 w-9">
      <rect x="4" y="10" width="40" height="28" rx="3" fill="white" stroke="#E8EAED" strokeWidth="1.2"/>
      {/* Left red triangle */}
      <path d="M4 13v22l11-11z" fill="#EA4335"/>
      {/* Right blue triangle */}
      <path d="M44 13v22L33 24z" fill="#4285F4"/>
      {/* Bottom left yellow */}
      <path d="M4 35l11-11 9 7z" fill="#FBBC04"/>
      {/* Bottom right green */}
      <path d="M44 35L33 24l-9 7z" fill="#34A853"/>
      {/* Top M fold */}
      <path d="M4 13l20 15L44 13" fill="none" stroke="#EA4335" strokeWidth="1.8"/>
    </svg>
  );
}

function OutlookLogo() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-9 w-9">
      {/* Main blue block */}
      <rect x="3" y="8" width="26" height="32" rx="4" fill="#0078D4"/>
      {/* White O ring */}
      <circle cx="16" cy="24" r="8.5" fill="white"/>
      <circle cx="16" cy="24" r="5.5" fill="#0078D4"/>
      {/* Right side panel */}
      <rect x="26" y="16" width="19" height="16" rx="2.5" fill="#28A8E8"/>
      {/* M fold on right panel */}
      <path d="M26 17.5l9.5 7 9.5-7" fill="none" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function YahooLogo() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-9 w-9">
      <rect width="48" height="48" rx="11" fill="#6001D2"/>
      {/* Y shape */}
      <path d="M12 12l12 12v12" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M36 12L24 24" stroke="white" strokeWidth="5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

function AppleMailLogo() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-9 w-9">
      <rect width="48" height="48" rx="11" fill="#1C7AFF"/>
      {/* Envelope body */}
      <rect x="7" y="13" width="34" height="22" rx="3" fill="white" opacity="0.95"/>
      {/* M fold */}
      <path d="M7 15.5l17 11 17-11" fill="none" stroke="#1C7AFF" strokeWidth="2.2" strokeLinejoin="round"/>
      {/* Bottom flap hints */}
      <path d="M7 35l9.5-10" stroke="#1C7AFF" strokeWidth="1.2" opacity="0.3" strokeLinecap="round"/>
      <path d="M41 35l-9.5-10" stroke="#1C7AFF" strokeWidth="1.2" opacity="0.3" strokeLinecap="round"/>
    </svg>
  );
}

function FastmailLogo() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-9 w-9">
      <rect width="48" height="48" rx="11" fill="#E04E14"/>
      {/* Fastmail lightning F */}
      <path d="M15 8h18L22 22h10L13 42l5-15H9z" fill="white"/>
    </svg>
  );
}

function ProtonMailLogo() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-9 w-9">
      <rect width="48" height="48" rx="11" fill="#6D4AFF"/>
      {/* Proton shield outline */}
      <path d="M24 6l15 6v11c0 9-15 19-15 19S9 32 9 23V12z" fill="white" opacity="0.95"/>
      {/* P letter */}
      <rect x="18" y="18" width="3" height="13" rx="1.5" fill="#6D4AFF"/>
      <path d="M21 18h5a4 4 0 010 8h-5z" fill="#6D4AFF"/>
    </svg>
  );
}

function HostcariLogo() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-9 w-9">
      <rect width="48" height="48" rx="11" fill="url(#hcg)"/>
      <defs>
        <linearGradient id="hcg" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#F97316"/>
          <stop offset="100%" stopColor="#C2410C"/>
        </linearGradient>
      </defs>
      {/* H letterform */}
      <rect x="10" y="11" width="6" height="26" rx="3" fill="white"/>
      <rect x="32" y="11" width="6" height="26" rx="3" fill="white"/>
      <rect x="10" y="20" width="28" height="6" rx="3" fill="white"/>
    </svg>
  );
}

function ZohoLogo() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-9 w-9">
      <rect width="48" height="48" rx="11" fill="white" stroke="#E8EAED" strokeWidth="1.5"/>
      {/* Zoho Z — dark red/maroon */}
      <path d="M10 13h28L10 35h28" stroke="#C02029" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

function ICloudLogo() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-9 w-9">
      <rect width="48" height="48" rx="11" fill="#F5F5F7"/>
      {/* Cloud body */}
      <path d="M34 30a6 6 0 00-1-12 10 10 0 10-18 4 6 6 0 000 8h19z" fill="#1C7AFF"/>
      {/* Envelope inside */}
      <rect x="16" y="20" width="16" height="11" rx="2" fill="white"/>
      <path d="M16 21.5l8 5 8-5" fill="none" stroke="#1C7AFF" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function ThunderbirdLogo() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-9 w-9">
      <rect width="48" height="48" rx="11" fill="#0A84FF"/>
      {/* Globe/orbit ring */}
      <circle cx="24" cy="24" r="13" fill="none" stroke="white" strokeWidth="1.5" opacity="0.25"/>
      {/* Bird swoop */}
      <path d="M11 24c0-7 6-13 13-13 4 0 7.5 1.8 10 4.5" stroke="white" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
      {/* Wing / triangle */}
      <path d="M24 11l4 6-4 2.5-4-2.5z" fill="white"/>
      {/* Envelope body */}
      <rect x="14" y="27" width="20" height="12" rx="2.5" fill="white" opacity="0.92"/>
      <path d="M14 28.5l10 6.5 10-6.5" fill="none" stroke="#0A84FF" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

const LOGOS = [
  { name: "Gmail",       component: <GmailLogo /> },
  { name: "Outlook",     component: <OutlookLogo /> },
  { name: "Yahoo Mail",  component: <YahooLogo /> },
  { name: "Apple Mail",  component: <AppleMailLogo /> },
  { name: "Fastmail",    component: <FastmailLogo /> },
  { name: "Proton Mail", component: <ProtonMailLogo /> },
  { name: "Hostcari",    component: <HostcariLogo /> },
  { name: "Zoho Mail",   component: <ZohoLogo /> },
  { name: "iCloud Mail", component: <ICloudLogo /> },
  { name: "Thunderbird", component: <ThunderbirdLogo /> },
];

export function LogoCarousel() {
  const items = [...LOGOS, ...LOGOS];

  return (
    <div className="relative w-full overflow-hidden py-2">
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 sm:w-32"
        style={{ background: "linear-gradient(to right, var(--cm-surface), transparent)" }} />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 sm:w-32"
        style={{ background: "linear-gradient(to left, var(--cm-surface), transparent)" }} />

      <div
        className="flex items-center gap-4"
        style={{
          width: "max-content",
          animation: "logoScroll 40s linear infinite",
        }}
        onMouseEnter={e => (e.currentTarget.style.animationPlayState = "paused")}
        onMouseLeave={e => (e.currentTarget.style.animationPlayState = "running")}
      >
        {items.map((logo, i) => (
          <div
            key={i}
            className="flex shrink-0 flex-col items-center gap-2.5 rounded-2xl border px-5 py-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            style={{
              borderColor: "var(--cm-border)",
              background: "var(--cm-bg)",
              boxShadow: "0 1px 6px rgba(15,23,42,0.05)",
              minWidth: 108,
            }}
          >
            {logo.component}
            <span className="text-[11.5px] font-[600]" style={{ color: "var(--cm-text2)" }}>
              {logo.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
