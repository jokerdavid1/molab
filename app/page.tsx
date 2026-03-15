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
      "Original microscope captures of grains before contour extraction and classification.",
    images: ["/demo/grain_1.png", "/demo/grain_2.png"],
  },
  {
    key: "contour",
    title: "Grain + Contour Detection",
    description:
      "Detected contours isolate particles and prepare them for digital analysis.",
    images: ["/demo/gc_1.png", "/demo/gc_2.png"],
  },
  {
    key: "sorted",
    title: "Sorted Grain Images",
    description:
      "Particles are organized into structured groups for digital sieve interpretation.",
    images: ["/demo/sort_1.png", "/demo/sort_2.png"],
  },
  {
    key: "sieve",
    title: "Sieve Representation",
    description:
      "The image-based workflow is translated into a sieve-style lab result.",
    images: ["/demo/sieve.png"],
    single: true,
  },
  {
    key: "psd",
    title: "Particle Size Distribution",
    description:
      "Final PSD output showing the grain size distribution in a clean visual chart.",
    images: ["/demo/psd.png"],
    single: true,
  },
];

const STAGE_DURATION = 2200;
const FADE_DURATION = 350;

export default function HomePage() {
  const [stageIndex, setStageIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fadeOutTimer = setTimeout(() => {
      setVisible(false);
    }, STAGE_DURATION - FADE_DURATION - 150);

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
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-10 left-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute right-20 top-1/3 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />
      </div>

      <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 py-12">
        <div className="mb-4 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-sm text-cyan-300">
          MoLab • Digital Sand Analysis
        </div>

        <h1 className="max-w-5xl text-center text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
          From Grain Images to <span className="text-cyan-400">PSD Results</span>
        </h1>

        <p className="mt-5 max-w-3xl text-center text-base leading-7 text-slate-300 sm:text-lg">
          An AI-driven workflow for grain imaging, contour detection, sorting,
          sieve interpretation, and particle size distribution analysis.
        </p>

        <div
          className={`mt-6 w-full transform transition-all ease-out ${
            visible ? "scale-100 opacity-100" : "scale-[0.985] opacity-0"
          }`}
          style={{ transitionDuration: `${FADE_DURATION}ms` }}
        >
          <div className="mx-auto w-full max-w-6xl rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-sm">
            <div className="flex h-[62vh] min-h-[520px] w-full items-center justify-center rounded-2xl bg-black/20 p-4">
              {currentStage.single ? (
                <div className="flex h-full w-full items-center justify-center">
                  <Image
                    src={currentStage.images[0]}
                    alt={currentStage.title}
                    width={1400}
                    height={900}
                    priority
                    className="max-h-full w-auto max-w-full rounded-2xl object-contain"
                  />
                </div>
              ) : (
                <div className="grid h-full w-full grid-cols-1 gap-6 md:grid-cols-2">
                  {currentStage.images.map((src, index) => (
                    <div
                      key={`${currentStage.key}-${index}`}
                      className="flex h-full items-center justify-center overflow-hidden rounded-2xl bg-black/20 p-3"
                    >
                      <Image
                        src={src}
                        alt={`${currentStage.title} ${index + 1}`}
                        width={900}
                        height={600}
                        priority
                        className="max-h-full w-auto max-w-full rounded-xl object-contain"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {STAGES.map((stage, i) => (
            <button
              key={stage.key}
              onClick={() => {
                setVisible(false);
                setTimeout(() => {
                  setStageIndex(i);
                  setVisible(true);
                }, 120);
              }}
              className={`rounded-full px-4 py-2 text-sm transition ${
                i === stageIndex
                  ? "bg-cyan-400 text-slate-950"
                  : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {stage.title}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
