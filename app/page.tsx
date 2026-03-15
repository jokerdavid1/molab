"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type ColumnStage = {
  key: string;
  label: string;
  images: string[];
};

const COLUMNS: ColumnStage[] = [
  {
    key: "raw",
    label: "Raw Grains",
    images: ["/demo/grain_1.png", "/demo/grain_2.png"],
  },
  {
    key: "contours",
    label: "Contours",
    images: ["/demo/gc_1.png", "/demo/gc_2.png"],
  },
  {
    key: "sorted",
    label: "Sorted",
    images: ["/demo/sort_1.png", "/demo/sort_2.png"],
  },
  {
    key: "results",
    label: "Results",
    images: ["/demo/sieve.png", "/demo/psd.png"],
  },
];

const SWITCH_MS = 2400;

export default function HomePage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoCycle = (startFrom?: number) => {
    if (typeof startFrom === "number") {
      setActiveIndex(startFrom);
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % COLUMNS.length);
    }, SWITCH_MS);
  };

  useEffect(() => {
    startAutoCycle();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleActivate = (index: number) => {
    startAutoCycle(index);
  };

  return (
    <main className="relative h-screen overflow-hidden bg-slate-950 text-white">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-8 h-56 w-56 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute left-10 top-[62%] h-44 w-44 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute right-10 top-[18%] h-44 w-44 rounded-full bg-sky-400/10 blur-3xl" />
      </div>

      <section className="relative mx-auto flex h-screen max-w-[1700px] flex-col justify-center px-4 py-4 sm:px-6 lg:px-8">
        {/* Top text */}
        <div className="flex flex-col items-center">
          <div className="mb-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300 sm:text-sm">
            MoLab • Digital Sand Analysis
          </div>

          <h1 className="max-w-5xl text-center text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            From Grain Images to <span className="text-cyan-400">PSD Results</span>
          </h1>

          <p className="mt-3 max-w-3xl text-center text-sm leading-6 text-slate-300 sm:text-base">
            Raw grains, contour detection, sorting, and final sieve plus PSD
            interpretation — all visible in one screen.
          </p>
        </div>

        {/* Buttons ABOVE frames */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {COLUMNS.map((col, i) => {
            const active = i === activeIndex;
            return (
              <button
                key={col.key}
                onClick={() => handleActivate(i)}
                className={`rounded-full px-3 py-1.5 text-xs transition sm:px-4 sm:py-2 sm:text-sm ${
                  active
                    ? "bg-cyan-400 text-slate-950"
                    : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {col.label}
              </button>
            );
          })}
        </div>

        {/* 4 frames */}
        <div className="mt-4 grid flex-1 grid-cols-2 gap-3 xl:grid-cols-4">
          {COLUMNS.map((col, colIndex) => {
            const active = colIndex === activeIndex;

            return (
              <button
                key={col.key}
                onClick={() => handleActivate(colIndex)}
                className={`relative flex h-full min-h-0 flex-col rounded-3xl border p-3 text-left transition-all duration-700 ease-out ${
                  active
                    ? "scale-[1.02] border-cyan-300/40 bg-white/10 opacity-100 shadow-[0_20px_60px_rgba(34,211,238,0.12)]"
                    : "scale-[0.985] border-white/10 bg-white/[0.04] opacity-45"
                }`}
                aria-label={`Activate ${col.label}`}
                type="button"
              >
                {/* Header */}
                <div className="mb-3 flex items-center justify-between">
                  <div
                    className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] transition sm:text-xs ${
                      active
                        ? "bg-cyan-400/20 text-cyan-200"
                        : "bg-white/5 text-slate-400"
                    }`}
                  >
                    {col.label}
                  </div>

                  <div
                    className={`h-2.5 w-2.5 rounded-full transition ${
                      active
                        ? "bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.9)]"
                        : "bg-white/15"
                    }`}
                  />
                </div>

                {/* Image area */}
                <div
                  className={`grid min-h-0 flex-1 gap-3 ${
                    col.key === "results" ? "grid-cols-2" : "grid-cols-1"
                  }`}
                >
                  {col.images.map((src, imgIndex) => (
                    <div
                      key={`${col.key}-${imgIndex}`}
                      className={`flex min-h-0 items-center justify-center overflow-hidden rounded-2xl border transition-all duration-700 ${
                        active
                          ? "border-white/15 bg-black/25"
                          : "border-white/5 bg-black/20"
                      }`}
                    >
                      <Image
                        src={src}
                        alt={`${col.label} ${imgIndex + 1}`}
                        width={900}
                        height={600}
                        priority
                        className={`h-full max-h-[22vh] w-full object-contain p-2 transition-all duration-700 sm:max-h-[24vh] xl:max-h-[34vh] ${
                          active ? "scale-100" : "scale-95"
                        }`}
                      />
                    </div>
                  ))}
                </div>

                {/* Glow */}
                <div
                  className={`pointer-events-none absolute inset-x-6 bottom-1 h-8 rounded-full blur-2xl transition ${
                    active ? "bg-cyan-400/20 opacity-100" : "opacity-0"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
