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

const SWITCH_MS = 2600;

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
      {/* background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_26%),radial-gradient(circle_at_18%_78%,rgba(59,130,246,0.08),transparent_18%),radial-gradient(circle_at_85%_24%,rgba(14,165,233,0.08),transparent_20%)]" />
        <div className="absolute left-1/2 top-8 h-56 w-56 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute left-10 top-[62%] h-44 w-44 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute right-10 top-[18%] h-44 w-44 rounded-full bg-sky-400/10 blur-3xl" />
      </div>

      <section className="relative mx-auto flex h-screen max-w-[1800px] flex-col justify-center px-4 py-3 sm:px-6 lg:px-8">
        {/* heading */}
        <div className="flex flex-col items-center">
          <div className="mb-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-300 sm:text-sm">
            MoLab
          </div>

          <h1 className="max-w-5xl text-center text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            From Grain Images to <span className="text-cyan-400">PSD Results</span>
          </h1>

          <p className="mt-3 max-w-3xl text-center text-sm leading-6 text-slate-300 sm:text-base">
            A premium visual workflow for grain imaging, contour detection,
            sorting, and final sieve plus PSD interpretation.
          </p>
        </div>

        {/* top labels with arrows */}
        <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
          {COLUMNS.map((col, i) => {
            const active = i === activeIndex;

            return (
              <div key={col.key} className="relative flex items-center justify-center">
                <button
                  onClick={() => handleActivate(i)}
                  className={`relative rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] transition-all duration-500 sm:text-sm ${
                    active
                      ? "scale-110 border-cyan-300/40 bg-cyan-400/15 text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.22)]"
                      : "scale-100 border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10 hover:text-slate-200"
                  }`}
                >
                  {col.label}
                </button>

                {i < COLUMNS.length - 1 && (
                  <div className="pointer-events-none absolute right-[-16px] top-1/2 z-10 hidden -translate-y-1/2 xl:flex items-center">
                    <div
                      className={`h-px w-8 transition-all duration-500 ${
                        active
                          ? "bg-gradient-to-r from-cyan-300/40 to-cyan-200"
                          : "bg-gradient-to-r from-white/10 to-slate-500/40"
                      }`}
                    />
                    <svg
                      className={`h-4 w-4 transition-all duration-500 ${
                        active ? "scale-110 text-cyan-300" : "text-slate-500"
                      }`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="M13 6l6 6-6 6" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* columns */}
        <div className="mt-4 grid flex-1 grid-cols-2 gap-3 xl:grid-cols-4">
          {COLUMNS.map((col, colIndex) => {
            const active = colIndex === activeIndex;

            return (
              <button
                key={col.key}
                onClick={() => handleActivate(colIndex)}
                className={`relative flex h-full min-h-0 flex-col rounded-[28px] border p-3 text-left transition-all duration-700 ease-out ${
                  active
                    ? "scale-[1.015] border-cyan-300/40 bg-white/[0.08] opacity-100 shadow-[0_24px_70px_rgba(34,211,238,0.12)]"
                    : "scale-[0.985] border-white/10 bg-white/[0.04] opacity-40"
                }`}
                aria-label={`Activate ${col.label}`}
                type="button"
              >
                {/* removed repeated text inside frame */}

                <div className="grid min-h-0 flex-1 grid-cols-1 gap-3">
                  {col.images.map((src, imgIndex) => (
                    <div
                      key={`${col.key}-${imgIndex}`}
                      className={`flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[22px] border transition-all duration-700 ${
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
                        className={`h-full max-h-[19vh] w-full object-contain p-2 transition-all duration-700 sm:max-h-[20vh] xl:max-h-[26vh] ${
                          active ? "scale-110" : "scale-95"
                        }`}
                      />
                    </div>
                  ))}
                </div>

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
