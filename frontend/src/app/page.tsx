"use client";
import CubeHeroAnimation from "@/components/CubeHeroAnimation";

export default function Home() {
  return (
    <div className="font-sans min-h-screen relative">
      {/* Background grid */}
      <div className="fixed inset-0 bg-gray-900 z-10"
      style={{
        backgroundImage: "repeating-linear-gradient(-30deg, rgba(25,25,25,0.7) 0px, rgba(25,25,25,0.7) 1px, rgba(17,17,17,0.5) 1px, rgba(17,17,17,0.5) 20px), repeating-linear-gradient(-150deg, rgba(25,25,25,0.7) 0px, rgba(25,25,25,0.7) 1px, rgba(17,17,17,0.5) 1px, rgba(17,17,17,0.5) 20px)",
      }} />
      
      {/* 3D Cube Animation - positioned on top */}
      <div className="fixed inset-0 z-20">
        <CubeHeroAnimation />
      </div>

      {/* Content overlay */}
      <div className="relative z-30 grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-mono">
        <main className="flex flex-col gap-[32px] row-start-2 items-center text-center">
          <div className="absolute z-20">
            <h1 className="text-5xl sm:text-7xl md:text-9xl text-left font-anton text-white drop-shadow-lg"
            style={{
              perspective: "1000px",
              transformStyle: "preserve-3d",
              transform: "skew(60deg, 330deg)",
              textShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
            }}>
              LUKE'S
              <br />
              CUBE SOLVER
            </h1>
          </div>
        </main>
      </div>
    </div>
  );
}