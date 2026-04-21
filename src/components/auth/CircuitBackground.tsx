'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CircuitBackgroundProps {
  dark?: boolean;
}

export const CircuitBackground = ({ dark = true }: CircuitBackgroundProps) => {
  return (
    <div className={`absolute inset-0 z-0 ${dark ? 'bg-black' : 'bg-slate-50/50'} overflow-hidden pointer-events-none`}>
      {/* Grid Pattern Layer */}
      <div 
        className="absolute inset-0 opacity-[0.2] dark:opacity-[0.3]"
        style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px), 
                           linear-gradient(90deg, rgba(59, 130, 246, 0.15) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Animated Circuit Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-60 dark:opacity-80">
        <defs>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* Vertical Data Flows */}
        {[...Array(15)].map((_, i) => (
          <motion.rect
            key={`v-${i}`}
            x={`${(i + 1) * 7.5}%`}
            y="-20%"
            width="1"
            height="40%"
            fill="url(#line-gradient)"
            initial={{ y: "-100%" }}
            animate={{ y: "200%" }}
            transition={{
              duration: 5 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
          />
        ))}

        {/* Horizontal Data Flows */}
        {[...Array(10)].map((_, i) => (
          <motion.rect
            key={`h-${i}`}
            x="-20%"
            y={`${(i + 1) * 12}%`}
            width="40%"
            height="1"
            fill="url(#line-gradient)"
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{
              duration: 8 + Math.random() * 12,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 8,
            }}
          />
        ))}
      </svg>

      {/* Radial Vignette for Focus */}
      <div className={`absolute inset-0 ${dark ? 'bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-40' : 'bg-[radial-gradient(circle_at_center,transparent_0%,rgba(248,250,252,0.8)_100%)] opacity-20'}`} />
    </div>
  );
};
