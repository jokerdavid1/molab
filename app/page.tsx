"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Stage = {
  title: string;
  description: string;
  images: string[];
  single?: boolean;
};

const STAGES: Stage[] = [
  {
    title: "Raw Grain Images",
    description: "Raw microscope grain images before processing.",
    images: ["/demo/grain_1.png", "/demo/grain_2.png"],
  },
  {
    title: "Grain Contours",
    description: "Contours detected around grains.",
    images: ["/demo/gc_1.png", "/demo/gc_2.png"],
  },
  {
    title: "Sorted Grains",
    description: "Grains grouped and organized.",
    images: ["/demo/sort_1.png", "/demo/sort_2.png"],
  },
  {
    title: "Sieve Representation",
    description: "Digital sieve interpretation.",
    images: ["/demo/sieve.png"],
    single: true,
  },
  {
    title: "Particle Size Distribution",
    description: "Final PSD output chart.",
    images: ["/demo/psd.png"],
    single: true,
  },
];

export default function HomePage() {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % STAGES.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const stage = STAGES[stageIndex];

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-10">

      <h1 className="text-5xl font-bold mb-10 text-center">
        MoLab Grain Analysis Pipeline
      </h1>

      <div className="text-center mb-8 max-w-3xl">
        <h2 className="text-3xl font-semibold mb-4">{stage.title}</h2>
        <p className="text-lg text-gray-300">{stage.description}</p>
      </div>

      {stage.single ? (
        <div className="w-full max-w-5xl">
          <Image
            src={stage.images[0]}
            alt="stage"
            width={1200}
            height={700}
            className="w-full object-contain rounded-lg"
          />
        </div>
      ) : (
        <div className="flex gap-10 justify-center w-full max-w-6xl">
          {stage.images.map((img, i) => (
            <Image
              key={i}
              src={img}
              alt="grain"
              width={500}
              height={300}
              className="rounded-lg object-contain"
            />
          ))}
        </div>
      )}
    </main>
  );
}
