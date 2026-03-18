"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";

type ColumnStage = {
  key: string;
  label: string;
  images: string[];
};

const COLUMNS: ColumnStage[] = [
  {
    key: "raw",
    label: "Sand Grains",
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
    key: "Results",
    label: "Results",
    images: ["/demo/sieve.png", "/demo/psd.png"],
  },
];

const SWITCH_MS = 2800;

export default function HomePage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoCycle = (startFrom?: number) => {
    if (typeof startFrom === "number") setActiveIndex(startFrom);

    if (intervalRef.current) clearInterval(intervalRef.current);

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

  useEffect(() => {
    const styleId = "molab-stage-arrow-animation";

    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `
        @keyframes slideArrow {
          0% { transform: translateX(0%); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateX(350%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const handleActivate = (index: number) => {
    startAutoCycle(index);
  };

  return (
    <main className="relative min-h-screen bg-[#020617] text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_25%),radial-gradient(circle_at_18%_78%,rgba(59,130,246,0.08),transparent_18%),radial-gradient(circle_at_85%_24%,rgba(14,165,233,0.08),transparent_20%)]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:44px_44px]" />
      </div>

      <section className="relative mx-auto flex min-h-screen max-w-[1800px] flex-col px-4 pt-0 pb-3 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="grid h-20 grid-cols-[1fr_auto_1fr] items-center">
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/logo/logo.png"
                alt="MoLab"
                width={190}
                height={72}
                priority
                sizes="190px"
                className="w-auto drop-shadow-[0_0_20px_rgba(34,211,238,0.28)]"
              />
            </Link>
          </div>

          <nav className="hidden items-center justify-center gap-8 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm text-slate-300 backdrop-blur-md md:flex">
            <Link href="/" className="transition hover:text-cyan-300">Home</Link>
            <Link href="/technology" className="transition hover:text-cyan-300">Technology</Link>
            <Link href="/services" className="transition hover:text-cyan-300">Services</Link>
            <Link href="/about" className="transition hover:text-cyan-300">About</Link>
            <Link href="/contact" className="transition hover:text-cyan-300">Contact</Link>
          </nav>

          <div className="flex justify-end">
            <Link
              href="/upload"
              className="rounded-full border border-cyan-300/30 bg-cyan-400/20 px-6 py-2.5 text-sm font-medium text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.18)] transition hover:scale-105 hover:bg-cyan-400/30"
            >
              Upload Sample
            </Link>
          </div>
        </header>

        {/* Title */}
        <div className="mt-1 flex flex-col items-center">
          <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-6 py-2 text-base uppercase tracking-[0.35em] text-cyan-300">
            AI SAND ANALYSIS
          </div>

          <p className="mt-3 max-w-xl text-center text-sm text-slate-400">
            Upload grain images and instantly generate automated sieve analysis.
          </p>
        </div>

        {/* ✅ FIXED STAGE BUTTONS (aligned with columns) */}
        <div className="mt-10 hidden xl:grid xl:grid-cols-4 xl:gap-3">
          {COLUMNS.map((col, i) => {
            const active = i === activeIndex;

            return (
              <div key={col.key} className="relative flex items-center justify-center">
                <button
                  onClick={() => handleActivate(i)}
                  className={`relative z-10 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] transition-all duration-500 ${
                    active
                      ? "scale-110 border-cyan-300/40 bg-cyan-400/15 text-cyan-200"
                      : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10 hover:text-slate-200"
                  }`}
                >
                  {col.label}
                </button>

                {i < COLUMNS.length - 1 && (
                  <div className="pointer-events-none absolute left-[calc(50%+56px)] top-1/2 hidden h-[2px] w-[calc(100%-112px+0.75rem)] -translate-y-1/2 xl:block">
                    <div className="relative h-full w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${
                          activeIndex > i ? "w-full bg-cyan-300/70" : "w-0 bg-transparent"
                        }`}
                      />
                      <div
                        className={`absolute inset-y-0 left-[-40%] w-[40%] rounded-full bg-gradient-to-r from-transparent via-cyan-200 to-transparent ${
                          activeIndex > i
                            ? "animate-[slideArrow_1.4s_linear_infinite]"
                            : "hidden"
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile buttons (unchanged) */}
        <div className="mt-10 grid grid-cols-2 gap-3 xl:hidden">
          {COLUMNS.map((col, i) => {
            const active = i === activeIndex;

            return (
              <div key={col.key} className="flex items-center justify-center">
                <button
                  onClick={() => handleActivate(i)}
                  className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] transition-all duration-500 ${
                    active
                      ? "scale-110 border-cyan-300/40 bg-cyan-400/15 text-cyan-200"
                      : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10 hover:text-slate-200"
                  }`}
                >
                  {col.label}
                </button>
              </div>
            );
          })}
        </div>

        {/* Columns (UNCHANGED) */}
        <div className="mt-4 grid gap-3 xl:grid-cols-4">
          {COLUMNS.map((col, colIndex) => {
            const active = colIndex === activeIndex;

            return (
              <button
                key={col.key}
                onClick={() => handleActivate(colIndex)}
                className={`relative flex min-h-[460px] flex-col rounded-[28px] border p-3 transition-all duration-700 ${
                  active
                    ? "scale-[1.02] border-cyan-300/40 bg-white/[0.08] shadow-[0_24px_70px_rgba(34,211,238,0.12)]"
                    : "scale-[0.98] border-white/10 bg-white/[0.04] opacity-40"
                }`}
              >
                <div className="grid flex-1 gap-3">
                  {col.images.map((src, imgIndex) => (
                    <div
                      key={`${col.key}-${imgIndex}`}
                      className="flex min-h-[200px] items-center justify-center overflow-hidden rounded-[22px] border border-white/10 bg-black/25"
                    >
                      <Image
                        src={src}
                        alt={`${col.label} ${imgIndex + 1}`}
                        width={900}
                        height={600}
                        priority
                        className={`h-full max-h-[260px] w-full object-contain p-2 transition-all duration-700 ${
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

        {/* CTA */}
        <div className="flex justify-center pb-6 pt-8">
          <Link
            href="/upload"
            className="rounded-full bg-cyan-400 px-8 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.35)] transition hover:scale-105"
          >
            Upload Your Sample
          </Link>
        </div>
      </section>
    </main>
  );
}
