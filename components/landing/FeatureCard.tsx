"use client";
import React, { useRef, useState } from "react";

interface FeatureCardProps {
  icon: string;
  title: string;
  desc: string;
  visual?: React.ReactNode;
}

export function FeatureCard({ icon, title, desc, visual }: FeatureCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setSpot({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative h-full overflow-hidden rounded-[24px] border p-6"
      style={{
        borderColor: hovered ? "rgba(249,115,22,0.24)" : "var(--cm-border)",
        background: "var(--cm-surface)",
        boxShadow: hovered
          ? "0 24px 64px rgba(15,23,42,0.13), 0 0 0 1px rgba(249,115,22,0.10)"
          : "var(--cm-shadow)",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        transition:
          "transform 0.32s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s cubic-bezier(0.16,1,0.3,1), border-color 0.32s",
      }}
    >
      {/* Mouse-following spotlight */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[24px]"
        style={{
          background: `radial-gradient(circle 190px at ${spot.x}% ${spot.y}%, rgba(249,115,22,0.09), transparent 65%)`,
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.2s",
        }}
      />

      {/* Shimmer sweep on hover */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.06) 50%, transparent 65%)",
          transform: hovered ? "translateX(250%)" : "translateX(-100%)",
          transition: hovered ? "transform 0.65s cubic-bezier(0.4,0,0.2,1)" : "none",
        }}
      />

      <div className="relative">
        <div
          className="mb-4 inline-block text-[28px]"
          style={{
            transform: hovered ? "translateY(-4px) scale(1.14)" : "translateY(0) scale(1)",
            transition: "transform 0.32s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          {icon}
        </div>
        <h4 className="text-[15px] font-[800]" style={{ color: "var(--cm-text)" }}>
          {title}
        </h4>
        <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: "var(--cm-text2)" }}>
          {desc}
        </p>
        {visual && React.isValidElement(visual)
          ? React.cloneElement(visual as React.ReactElement<{ paused?: boolean }>, { paused: !hovered })
          : visual}
      </div>
    </div>
  );
}
