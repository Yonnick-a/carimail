"use client";

// SVG brand marks — clean, recognizable representations of each provider

function GmailLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="h-9 w-9">
      {/* Envelope body */}
      <rect x="3" y="9" width="34" height="22" rx="3" fill="white" stroke="#E8EAED" strokeWidth="1.2"/>
      {/* Left inner flap — green */}
      <path d="M3 11v18l9-9z" fill="#34A853"/>
      {/* Right inner flap — blue */}
      <path d="M37 11v18l-9-9z" fill="#4285F4"/>
      {/* Bottom triangle left — yellow */}
      <path d="M3 29l9-9 8 6.5z" fill="#FBBC05"/>
      {/* Bottom triangle right — red */}
      <path d="M37 29l-9-9-8 6.5z" fill="#EA4335"/>
      {/* The M fold — top */}
      <path d="M3 11l17 13 17-13" fill="none" stroke="#EA4335" strokeWidth="1.5"/>
    </svg>
  );
}

function OutlookLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="h-9 w-9">
      {/* Blue bg square */}
      <rect x="3" y="7" width="22" height="26" rx="3" fill="#0078D4"/>
      {/* White O circle */}
      <circle cx="14" cy="20" r="7" fill="white"/>
      <circle cx="14" cy="20" r="4.5" fill="#0078D4"/>
      {/* Right panel — lighter blue */}
      <rect x="22" y="14" width="16" height="13" rx="2" fill="#28A8E8"/>
      {/* Email lines on right panel */}
      <path d="M22 14l7 7 7-7" fill="none" stroke="white" strokeWidth="1.2"/>
    </svg>
  );
}

function YahooLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="h-9 w-9">
      <rect width="40" height="40" rx="10" fill="#6001D2"/>
      {/* Y shape */}
      <path d="M10 10l10 10v10" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M30 10L20 20" stroke="white" strokeWidth="4.5" strokeLinecap="round" fill="none"/>
      {/* ! dot */}
      <circle cx="32" cy="30" r="3" fill="white"/>
      <rect x="30.5" y="14" width="3" height="10" rx="1.5" fill="white"/>
    </svg>
  );
}

function AppleMailLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="h-9 w-9">
      <rect width="40" height="40" rx="10" fill="#007AFF"/>
      {/* Envelope */}
      <rect x="6" y="11" width="28" height="19" rx="2.5" fill="white" opacity="0.9"/>
      {/* M fold */}
      <path d="M6 13l14 9 14-9" fill="none" stroke="#007AFF" strokeWidth="2"/>
      {/* Left flap */}
      <path d="M6 30l8-9" stroke="#007AFF" strokeWidth="1.2" opacity="0.5"/>
      {/* Right flap */}
      <path d="M34 30l-8-9" stroke="#007AFF" strokeWidth="1.2" opacity="0.5"/>
    </svg>
  );
}

function FastmailLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="h-9 w-9">
      <rect width="40" height="40" rx="10" fill="#E04E14"/>
      {/* Fastmail F mark — lightning bolt style */}
      <path d="M13 8h14l-7 10h7L11 34l4-12H8z" fill="white"/>
    </svg>
  );
}

function ProtonMailLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="h-9 w-9">
      <rect width="40" height="40" rx="10" fill="#6D4AFF"/>
      {/* Shield */}
      <path d="M20 7l12 5v9c0 7-12 13-12 13S8 28 8 21v-9z" fill="white" opacity="0.9"/>
      {/* P letter */}
      <path d="M16 16h6a3 3 0 010 6h-6v-6z" fill="#6D4AFF"/>
      <rect x="16" y="22" width="2.5" height="5" rx="1" fill="#6D4AFF"/>
    </svg>
  );
}

function HostcariLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="h-9 w-9">
      <rect width="40" height="40" rx="10" fill="url(#hc-grad)"/>
      <defs>
        <linearGradient id="hc-grad" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="#F97316"/>
          <stop offset="100%" stopColor="#EA580C"/>
        </linearGradient>
      </defs>
      {/* H letter */}
      <rect x="9" y="10" width="5" height="20" rx="2.5" fill="white"/>
      <rect x="26" y="10" width="5" height="20" rx="2.5" fill="white"/>
      <rect x="9" y="17.5" width="22" height="5" rx="2.5" fill="white"/>
    </svg>
  );
}

function ZohoLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="h-9 w-9">
      <rect width="40" height="40" rx="10" fill="#E14D2A"/>
      {/* Z shape */}
      <path d="M10 12h20L10 28h20" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

function ICloudLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="h-9 w-9">
      <rect width="40" height="40" rx="10" fill="#F5F5F7"/>
      {/* Cloud shape */}
      <path d="M28 25a5 5 0 00-1-9.9A8 8 0 1012 25h16z" fill="#007AFF"/>
      {/* Envelope inside cloud */}
      <rect x="14" y="17" width="12" height="9" rx="1.5" fill="white"/>
      <path d="M14 18.5l6 4 6-4" fill="none" stroke="#007AFF" strokeWidth="1"/>
    </svg>
  );
}

function ThunderbirdLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="h-9 w-9">
      <rect width="40" height="40" rx="10" fill="#0A84FF"/>
      {/* Bird / envelope mark */}
      <circle cx="20" cy="20" r="11" fill="white" opacity="0.15"/>
      <path d="M10 20c0-5.5 4.5-10 10-10 3 0 5.5 1.3 7.3 3.3" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M20 10l3 4-3 2-3-2z" fill="white"/>
      <rect x="12" y="22" width="16" height="10" rx="2" fill="white" opacity="0.9"/>
      <path d="M12 23.5l8 5 8-5" fill="none" stroke="#0A84FF" strokeWidth="1.2"/>
    </svg>
  );
}

const LOGOS = [
  { name: "Gmail",       component: <GmailLogo /> },
  { name: "Outlook",     component: <OutlookLogo /> },
  { name: "Yahoo Mail",  component: <YahooLogo /> },
  { name: "Apple Mail",  component: <AppleMailLogo /> },
  { name: "Fastmail",    component: <FastmailLogo /> },
  { name: "ProtonMail",  component: <ProtonMailLogo /> },
  { name: "Hostcari",    component: <HostcariLogo /> },
  { name: "Zoho Mail",   component: <ZohoLogo /> },
  { name: "iCloud Mail", component: <ICloudLogo /> },
  { name: "Thunderbird", component: <ThunderbirdLogo /> },
];

export function LogoCarousel() {
  // Duplicate for seamless infinite loop
  const items = [...LOGOS, ...LOGOS];

  return (
    <div className="relative w-full overflow-hidden py-3">
      {/* Fade left edge */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 sm:w-40"
        style={{ background: "linear-gradient(to right, var(--cm-surface), transparent)" }} />
      {/* Fade right edge */}
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 sm:w-40"
        style={{ background: "linear-gradient(to left, var(--cm-surface), transparent)" }} />

      <div
        className="flex items-center gap-5"
        style={{
          width: "max-content",
          animation: "logoScroll 38s linear infinite",
        }}
        onMouseEnter={e => (e.currentTarget.style.animationPlayState = "paused")}
        onMouseLeave={e => (e.currentTarget.style.animationPlayState = "running")}
      >
        {items.map((logo, i) => (
          <div
            key={i}
            className="flex shrink-0 flex-col items-center gap-2 rounded-2xl border px-5 py-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            style={{
              borderColor: "var(--cm-border)",
              background: "var(--cm-surface)",
              boxShadow: "0 1px 6px rgba(15,23,42,0.05)",
              minWidth: 110,
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
