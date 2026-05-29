"use client";
import { createContext, useContext, useEffect, useState } from "react";

interface FocusModeCtx {
  focusMode: boolean;
  setFocusMode: (v: boolean) => void;
  paletteOpen: boolean;
  setPaletteOpen: (v: boolean) => void;
}

const Ctx = createContext<FocusModeCtx>({
  focusMode: false, setFocusMode: () => {},
  paletteOpen: false, setPaletteOpen: () => {},
});

export function MailFocusProvider({ children }: { children: React.ReactNode }) {
  const [focusMode, setFocusModeState] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem("carimail-focus-mode") === "1") setFocusModeState(true);
    } catch {}
  }, []);

  function setFocusMode(v: boolean) {
    setFocusModeState(v);
    try { localStorage.setItem("carimail-focus-mode", v ? "1" : "0"); } catch {}
  }

  return <Ctx.Provider value={{ focusMode, setFocusMode, paletteOpen, setPaletteOpen }}>{children}</Ctx.Provider>;
}

export function useMailFocus() { return useContext(Ctx); }
