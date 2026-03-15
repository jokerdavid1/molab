"use client";

import Image from "next/image";
import Link from "next/link";
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

  const handleActivate = (index: number) => {
    startAutoCycle(index);
  };

  return (
    <main className="relative h-screen overflow-hidden bg-[#020617] text-white">
      
      {/* background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_25%),radial-gradient(circle_at_18%_78%,rgba(59,130,246,0.08),transparent_18%),radial-gradient(circle_at_85%_24%,rgba(14,165,233,0.08),transparent_20%)]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:44px_44px]" />
      </div>

      <section className="relative mx-auto flex h-screen max-w-[1800px] flex-col px-4 py-3 sm:px-6 lg:px-8">

        {/* HEADER */}
        <header className="grid grid-cols-[1fr_auto_1fr] items-center pt-2">

          {/* logo */}
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="MoLab"
                width={320}
                height={120}
                priority
                className="max-h-20 w-auto drop-shadow-[0_0_18px_rgba(34,211,238,0.25)]"
              />
            </Link>
          </div>

          {/* center nav */}
          <nav className="hidden items-center justify-center gap-8 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm text-slate-300 backdrop-blur-md md:flex">
            <Link href="/technology" className="hover:text-cyan-300 transition">
              Technology
            </Link>
            <Link href="/services" className="hover:text-cyan-300 transition">
              Services
            </Link>
            <Link href="/about" className="hover:text-cyan-300 transition">
              About
            </Link>
            <Link href="/contact" className="hover:text-cyan-300 transition">
              Contact
            </Link>
          </nav>

          {/* upload button right */}
          <div className="flex justify-end">
            <Link
              href="/upload"
              className="rounded-full border border-cyan-300/30 bg-cyan-400/20 px-6 py-2.5 text-sm font-medium text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.18)] transition hover:scale-105 hover:bg-cyan-400/30"
            >
              Upload Sample
            </Link>
          </div>
        </header>

        {/* heading */}
        <div className="mt-4 flex flex-col items-center">
          <div className="mb-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-cyan-300">
            AI-Powered Grain Analysis
          </div>

          <h1 className="max-w-5xl text-center text-4xl font-semibold leading-tight tracking-[-0.03em] lg:text-5xl">
            From Grain Images to{" "}
            <span className="bg-gradient-to-r from-white via-cyan-200 to-sky-400 bg-clip-text text-transparent">
              PSD Results
            </span>
          </h1>

          <p className="mt-3 max-w-3xl text-center text-slate-300">
            A premium workflow for grain imaging, contour detection, particle
            sorting and final sieve + PSD interpretation.
          </p>
        </div>

        {/* stage labels */}
        <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
          {COLUMNS.map((col, i) => {
            const active = i === activeIndex;

            return (
              <div key={col.key} className="flex justify-center">
                <button
                  onClick={() => handleActivate(i)}
                  className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] transition-all ${
                    active
                      ? "scale-110 border-cyan-300/40 bg-cyan-400/15 text-cyan-200"
                      : "border-white/10 bg-white/5 text-slate-400"
                  }`}
                >
                  {col.label}
                </button>
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
                className={`flex flex-col rounded-[28px] border p-3 transition-all duration-700 ${
                  active
                    ? "scale-[1.015] border-cyan-300/40 bg-white/[0.08]"
                    : "scale-[0.985] border-white/10 bg-white/[0.04] opacity-40"
                }`}
              >
                <div className="grid flex-1 grid-cols-1 gap-3">
                  {col.images.map((src, imgIndex) => (
                    <div
                      key={imgIndex}
                      className="flex items-center justify-center rounded-[22px] border border-white/10 bg-black/25"
                    >
                      <Image
                        src={src}
                        alt=""
                        width={900}
                        height={600}
                        className={`object-contain p-2 transition-all duration-700 ${
                          active ? "scale-110" : "scale-95"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* MAIN CTA */}
        <div className="flex justify-center pb-4 pt-6">
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
