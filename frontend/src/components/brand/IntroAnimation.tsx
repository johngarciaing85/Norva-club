"use client";

import { useSyncExternalStore, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

function hasSeenIntro(): boolean {
  try {
    return sessionStorage.getItem("norva-intro-seen") === "1";
  } catch {
    return false;
  }
}

function markIntroSeen(): void {
  try {
    sessionStorage.setItem("norva-intro-seen", "1");
  } catch {
    // storage unavailable
  }
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// External store — useSyncExternalStore reads it without hydration mismatch.
// getServerSnapshot returns false (no overlay in SSR HTML → page content is
// visible to crawlers), getSnapshot reads sessionStorage on the client.
// React handles the server/client difference with a synchronous re-render
// during hydration, which does NOT produce a hydration warning — this is the
// exact use case getServerSnapshot was designed for.
let storeListeners: Array<() => void> = [];
let cachedVisible: boolean | null = null;

function subscribe(cb: () => void) {
  storeListeners = [...storeListeners, cb];
  return () => {
    storeListeners = storeListeners.filter((l) => l !== cb);
  };
}

function getSnapshot(): boolean {
  if (cachedVisible === null) cachedVisible = !hasSeenIntro();
  return cachedVisible;
}

function getServerSnapshot(): boolean {
  return false;
}

function dismiss() {
  markIntroSeen();
  cachedVisible = false;
  storeListeners.forEach((l) => l());
}

export function IntroAnimation() {
  const visible = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!visible) return;
    const delay = prefersReducedMotion() ? 400 : 2400;
    timerRef.current = setTimeout(dismiss, delay);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible]);

  const skip = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    dismiss();
  }, []);

  if (!visible) return null;

  const reduced = prefersReducedMotion();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-baseline gap-[0.15em] text-white font-heading font-black text-4xl sm:text-6xl tracking-[0.15em] uppercase">
            <motion.span
              initial={reduced ? { opacity: 0 } : { x: "-100vw", opacity: 0 }}
              animate={reduced ? { opacity: 1 } : { x: 0, opacity: 1 }}
              transition={{ duration: reduced ? 0.2 : 0.7, ease: "easeOut" }}
            >
              N&Oacute;RVA
            </motion.span>
            <motion.span
              initial={reduced ? { opacity: 0 } : { x: "100vw", opacity: 0 }}
              animate={reduced ? { opacity: 1 } : { x: 0, opacity: 1 }}
              transition={{ duration: reduced ? 0.2 : 0.7, ease: "easeOut" }}
            >
              STYLE
            </motion.span>
          </div>

          <motion.p
            className="mt-4 text-white/70 text-sm sm:text-base tracking-[0.3em] uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduced ? 0.2 : 0.9, duration: 0.5 }}
          >
            Move Different.
          </motion.p>

          <button
            onClick={skip}
            className="absolute bottom-8 text-white/50 hover:text-white text-xs tracking-widest uppercase transition-colors"
          >
            Saltar
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
