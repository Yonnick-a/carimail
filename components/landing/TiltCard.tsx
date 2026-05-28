"use client";
import { useRef } from "react";

export function TiltCard({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect   = el.getBoundingClientRect();
    const x      = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
    const y      = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
    el.style.transform = `perspective(1200px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) scale3d(1.01,1.01,1.01)`;
  }

  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(1200px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)";
  }

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ transformStyle: "preserve-3d", transition: "transform 0.18s ease", ...style }}
    >
      {children}
    </div>
  );
}
