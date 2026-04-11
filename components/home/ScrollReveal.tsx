"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function ScrollReveal({
  children,
  className = "",
  delayMs = 0,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        if (delayMs > 0) {
          window.setTimeout(() => setVisible(true), delayMs);
        } else {
          setVisible(true);
        }
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delayMs]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out will-change-[opacity,transform] ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
    >
      {children}
    </div>
  );
}
