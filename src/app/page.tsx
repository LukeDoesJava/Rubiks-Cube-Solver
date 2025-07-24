"use client";
import Cube from "@/components/Cube";

export default function Home() {
  return (
    <div className="font-sans min-h-screen relative">
      {/* Background canvas */}
      <canvas 
        id="rubiks-cube" 
        className="fixed inset-0 w-full h-full"
      />
      
      {/* Content overlay */}
      <div className="relative z-10 grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
        <main className="flex flex-col gap-[32px] row-start-2 items-center text-center">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">
            Welcome to Luke's Rubiks Cube Solver
          </h1>
          <Cube />
        </main>
      </div>
    </div>
  );
}