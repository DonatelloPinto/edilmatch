"use client";

import { useEffect, useRef, useState } from "react";

function formatIt(n: number) {
  return n.toLocaleString("it-IT");
}

export function HomeStatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [n1, setN1] = useState(0);
  const [n2, setN2] = useState(0);
  const [n3, setN3] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const duration = 1500;
    const t0 = performance.now();
    const targets = [1200, 4800, 98];
    const setters = [setN1, setN2, setN3];
    let frame: number;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - (1 - p) ** 3;
      for (let i = 0; i < 3; i++) {
        setters[i](Math.round(targets[i] * eased));
      }
      if (p < 1) frame = requestAnimationFrame(tick);
      else targets.forEach((t, i) => setters[i](t));
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visible]);

  return (
    <section
      ref={ref}
      className={`bg-[#0f2444] py-16 text-white transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      <div className="container-app">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="text-center">
            <p className="font-heading text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              {formatIt(n1)}+
            </p>
            <p className="mt-2 text-sm font-medium text-white/75">Professionisti</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              {formatIt(n2)}+
            </p>
            <p className="mt-2 text-sm font-medium text-white/75">Lavori</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-4xl font-extrabold tracking-tight text-white md:text-5xl">{n3}%</p>
            <p className="mt-2 text-sm font-medium text-white/75">Soddisfatti</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-4xl font-extrabold tracking-tight text-white md:text-5xl">€0</p>
            <p className="mt-2 text-sm font-medium text-white/75">Per i clienti</p>
          </div>
        </div>
      </div>
    </section>
  );
}
