"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

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

const SWITCH_MS = 2200;

export default function HomePage() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % COLUMNS.length);
    }, SWITCH_MS);

    return () => clearInterval(timer);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-12 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute left-16 top-[60%] h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute right-16 top-[20%] h-56 w-56 rounded-full bg-sky-400/10 blur-3xl" />
      </div>

      <section className="relative mx-auto flex min-h-screen max-w-[1800px] flex-col justify-center px-6 py-10">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-sm text-cyan-300">
            MoLab • Digital Sand Analysis
          </div>
        </div>

        <h1 className="mx-auto max-w-6xl text-center text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
          From Grain Images to <span className="text-cyan-400">PSD Results</span>
        </h1>

        <p className="mx-auto mt-5 max-w-3xl text-center text-base leading-7 text-slate-300 sm:text-lg">
          A visual workflow for grain imaging, contour detection, sorting, and
          final sieve plus PSD interpretation.
        </p>

        {/* stage buttons ABOVE */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {COLUMNS.map((col, i) => {
            const active = i === activeIndex;
            return (
              <button
                key={col.key}
                onClick={() => setActiveIndex(i)}
                className={`rounded-full px-4 py-2 text-sm transition ${
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

        {/* 4 fixed columns */}
        <div className="mt-8 grid grid-cols-1 gap-5 xl:grid-cols-4">
          {COLUMNS.map((col, colIndex) => {
            const active = colIndex === activeIndex;

            return (
              <div
                key={col.key}
                className={`relative rounded-3xl border p-4 transition-all duration-700 ease-out ${
                  active
                    ? "scale-[1.03] border-cyan-300/40 bg-white/10 shadow-[0_20px_80px_rgba(34,211,238,0.15)]"
                    : "scale-[0.98] border-white/10 bg-white/[0.04] opacity-45"
                }`}
              >
                {/* top label */}
                <div className="mb-4 flex items-center justify-between">
                  <div
                    className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em] transition ${
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

                {/* images stack */}
                <div className="grid gap-4">
                  {col.images.map((src, imgIndex) => (
                    <div
                      key={`${col.key}-${imgIndex}`}
                      className={`flex h-[260px] w-full items-center justify-center overflow-hidden rounded-2xl border transition-all duration-700 ${
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
                        className={`h-full w-full object-contain transition-all duration-700 ${
                          active ? "scale-100" : "scale-95"
                        }`}
                      />
                    </div>
                  ))}
                </div>

                {/* subtle bottom glow for active column */}
                <div
                  className={`pointer-events-none absolute inset-x-8 bottom-0 h-12 rounded-full blur-2xl transition ${
                    active ? "bg-cyan-400/20 opacity-100" : "opacity-0"
                  }`}
                />
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
