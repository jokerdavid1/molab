"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Stage = {
  key: string;
  title: string;
  description: string;
  images: string[];
  single?: boolean;
};

const STAGES: Stage[] = [
  {
    key: "raw",
    title: "Raw Grain Images",
    description:
      "Raw microscope grain images are captured as the first input for analysis.",
    images: ["/demo/grain_1.png", "/demo/grain_2.png"],
  },
  {
    key: "contour",
    title: "Grain + Contour Detection",
    description:
      "Contours are detected around grains to isolate particles for further shape and size analysis.",
    images: ["/demo/gc_1.png", "/demo/gc_2.png"],
  },
  {
    key: "sorted",
    title: "Sorted Grain Images",
    description:
      "The grains are sorted into organized groups to prepare for digital sieve interpretation.",
    images: ["/demo/sort_1.png", "/demo/sort_2.png"],
  },
  {
    key: "sieve",
    title: "Sieve Distribution",
    description:
      "The image workflow is converted into a sieve-style result for comparison with traditional lab methods.",
    images: ["/demo/sieve.png"],
    single: true,
  },
  {
    key: "psd",
    title: "Particle Size Distribution",
    description:
      "Finally, the PSD chart summarizes the grain size distribution in a clean visual output.",
    images: ["/demo/psd.png"],
    single: true,
  },
];

const STAGE_DURATION = 3200;

export default function HomePage() {
  const [stageIndex, setStageIndex] = useState(0);
  const [animPhase, setAnimPhase] = useState<"in" | "hold" | "out">("in");

  useEffect(() => {
    const phase1 = setTimeout(() => setAnimPhase("hold"), 700);
    const phase2 = setTimeout(() => setAnimPhase("out"), 2200);

    const next = setTimeout(() => {
      setStageIndex((prev) => (prev + 1) % STAGES.length);
      setAnimPhase("in");
    }, STAGE_DURATION);

    return () => {
      clearTimeout(phase1);
      clearTimeout(phase2);
      clearTimeout(next);
    };
  }, [stageIndex]);

  const currentStage = STAGES[stageIndex];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <section className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-16">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2">
          {/* Left text */}
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-sm text-cyan-300">
              MoLab • Digital Sand Analysis
            </div>

            <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              From Grain Images to{" "}
              <span className="text-cyan-400">PSD Results</span>
            </h1>

            <p className="max-w-xl text-lg leading-8 text-slate-300">
              MoLab transforms raw grain images into contour-based analysis,
              sorted particle groups, sieve interpretation, and particle size
              distribution outputs.
            </p>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-sm">
              <p className="mb-2 text-sm uppercase tracking-[0.2em] text-cyan-300">
                Current Stage
              </p>
              <h2 className="mb-3 text-2xl font-semibold">
                {currentStage.title}
              </h2>
              <p className="text-slate-300">{currentStage.description}</p>
            </div>
          </div>

          {/* Right animation */}
          <div className="relative flex items-center justify-center">
            <div
              className={`w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-md transition-all duration-700 ${
                animPhase === "in"
                  ? "scale-90 opacity-0"
                  : animPhase === "hold"
                  ? "scale-100 opacity-100"
                  : "scale-110 opacity-0"
              }`}
            >
              {currentStage.single ? (
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-black/30">
                  <Image
                    src={currentStage.images[0]}
                    alt={currentStage.title}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {currentStage.images.map((src, index) => (
                    <div
                      key={`${currentStage.key}-${index}`}
                      className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-black/30"
                    >
                      <Image
                        src={src}
                        alt={`${currentStage.title} ${index + 1}`}
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* stage indicators */}
            <div className="absolute -bottom-8 left-1/2 flex -translate-x-1/2 gap-3">
              {STAGES.map((stage, i) => (
                <button
                  key={stage.key}
                  onClick={() => {
                    setStageIndex(i);
                    setAnimPhase("in");
                  }}
                  className={`h-3 w-3 rounded-full transition-all ${
                    i === stageIndex
                      ? "bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)]"
                      : "bg-white/25 hover:bg-white/50"
                  }`}
                  aria-label={`Go to ${stage.title}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
