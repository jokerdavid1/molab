"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Stage = {
  key: string;
  label: string;
  images: string[];
  single?: boolean;
};

const STAGES: Stage[] = [
  {
    key: "raw",
    label: "Raw",
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
    key: "sieve",
    label: "Sieve",
    images: ["/demo/sieve.png"],
    single: true,
  },
  {
    key: "psd",
    label: "PSD",
    images: ["/demo/psd.png"],
    single: true,
  },
];

const STAGE_DURATION = 2600;
const FADE_DURATION = 500;

export default function HomePage() {
  const [stageIndex, setStageIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fadeOutTimer = setTimeout(() => {
      setVisible(false);
    }, STAGE_DURATION - FADE_DURATION - 120);

    const nextTimer = setTimeout(() => {
      setStageIndex((prev) => (prev + 1) % STAGES.length);
      setVisible(true);
    }, STAGE_DURATION);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(nextTimer);
    };
  }, [stageIndex]);

  const currentStage = STAGES[stageIndex];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_28%),radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.10),transparent_22%),radial-gradient(circle_at_80%_30%,rgba(14,165,233,0.12),transparent_24%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02),rgba(255,255,255,0))]" />
        <div className="absolute left-1/2 top-[-140px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute left-[8%] top-[58%] h-[260px] w-[260px] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute right-[8%] top-[24%] h-[280px] w-[280px] rounded-full bg-sky-400/10 blur-3xl" />
      </div>

      {/* Fine grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 py-10">
        {/* Eyebrow */}
        <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.95)]" />
          <span className="text-xs font-medium uppercase tracking-[0.30em] text-slate-300">
            MoLab
          </span>
        </div>

        {/* Headline */}
        <h1 className="max-w-6xl text-center text-5xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
          Digital Grain Analysis,
          <br />
          <span className="bg-gradient-to-r from-white via-cyan-200 to-sky-400 bg-clip-text text-transparent">
            Reimagined
          </span>
        </h1>

        <p className="mt-6 max-w-3xl text-center text-base leading-7 text-slate-300 sm:text-lg">
          A premium visual workflow for transforming grain imagery into contour
          intelligence, sorted particle views, sieve interpretation, and PSD output.
        </p>

        {/* Stage pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {STAGES.map((stage, i) => {
            const active = i === stageIndex;

            return (
              <button
                key={stage.key}
                onClick={() => {
                  setVisible(false);
                  setTimeout(() => {
                    setStageIndex(i);
                    setVisible(true);
                  }, 120);
                }}
                className={`group relative overflow-hidden rounded-full border px-5 py-2.5 text-sm font-medium tracking-[0.08em] transition-all duration-300 ${
                  active
                    ? "border-cyan-300/40 bg-white text-slate-950 shadow-[0_0_30px_rgba(255,255,255,0.18)]"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                <span className="relative z-10">{stage.label}</span>
                {active && (
                  <span className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.95),rgba(186,230,253,0.95))]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Showcase frame */}
        <div className="mt-10 w-full">
          <div className="mx-auto w-full max-w-6xl rounded-[32px] border border-white/10 bg-white/[0.06] p-[1px] shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
            <div className="rounded-[31px] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-4 sm:p-5">
              {/* top bar */}
              <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-400/80 shadow-[0_0_14px_rgba(34,211,238,0.8)]" />
                </div>

                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-slate-300">
                  {currentStage.label}
                </div>
              </div>

              {/* fixed frame */}
              <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.08),rgba(0,0,0,0)_28%),linear-gradient(180deg,rgba(10,15,29,0.96),rgba(3,7,18,0.98))]">
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0))]" />

                <div
                  className={`relative flex h-[62vh] min-h-[500px] w-full items-center justify-center px-4 py-5 transition-all ease-out sm:px-6 ${
                    visible
                      ? "scale-100 opacity-100 blur-0"
                      : "scale-[0.987] opacity-0 blur-[1px]"
                  }`}
                  style={{ transitionDuration: `${FADE_DURATION}ms` }}
                >
                  {currentStage.single ? (
                    <div className="flex h-full w-full items-center justify-center">
                      <Image
                        src={currentStage.images[0]}
                        alt={currentStage.label}
                        width={1500}
                        height={1000}
                        priority
                        className="max-h-full w-auto max-w-full rounded-2xl object-contain shadow-[0_10px_40px_rgba(0,0,0,0.35)]"
                      />
                    </div>
                  ) : (
                    <div className="grid h-full w-full grid-cols-1 gap-5 md:grid-cols-2">
                      {currentStage.images.map((src, index) => (
                        <div
                          key={`${currentStage.key}-${index}`}
                          className="group relative flex h-full items-center justify-center overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                        >
                          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]" />
                          <Image
                            src={src}
                            alt={`${currentStage.label} ${index + 1}`}
                            width={1000}
                            height={700}
                            priority
                            className="relative z-10 max-h-full w-auto max-w-full rounded-xl object-contain transition-transform duration-500 group-hover:scale-[1.015]"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom note */}
        <div className="mt-6 text-center text-xs uppercase tracking-[0.30em] text-slate-500">
          Imaging • Detection • Sorting • Sieve • PSD
        </div>
      </section>
    </main>
  );
}
