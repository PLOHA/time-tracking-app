"use client";
import React from 'react';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Container for blobs, with a slight blending effect if needed */}
      <div className="absolute inset-0 opacity-60 mix-blend-multiply dark:mix-blend-screen transition-opacity duration-1000">
        
        {/* Blob 1: Cyan/Blueish */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-cyan-300 dark:bg-cyan-900/40 mix-blend-multiply dark:mix-blend-screen filter blur-[100px] animate-blob1" />

        {/* Blob 2: Purple/Pinkish */}
        <div className="absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] max-w-[500px] max-h-[500px] rounded-full bg-purple-300 dark:bg-purple-900/40 mix-blend-multiply dark:mix-blend-screen filter blur-[100px] animate-blob2" />

        {/* Blob 3: Mint/Greenish */}
        <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full bg-emerald-200 dark:bg-emerald-900/40 mix-blend-multiply dark:mix-blend-screen filter blur-[100px] animate-blob3" />
        
      </div>
    </div>
  );
}
